"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Loader2,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  mentorshipService,
  type PersonalMentorshipSession,
} from "@/services/mentorship.service";
import { toast } from "sonner";

interface InlineBookingCardProps {
  session: PersonalMentorshipSession;
  mentorName?: string;
  mentorCalendlyUrl?: string | null;
  canManage?: boolean;
}

const DEFAULT_TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
  "07:30 PM",
];

export function InlineBookingCard({
  session,
  mentorName,
  mentorCalendlyUrl,
  canManage = false,
}: InlineBookingCardProps) {
  const queryClient = useQueryClient();

  // If already scheduled with a meeting link, allow toggling reschedule mode
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Parse existing scheduledAt date if present
  const initialDate = useMemo(() => {
    if (session.scheduledAt) {
      const d = new Date(session.scheduledAt);
      if (!isNaN(d.getTime())) return d;
    }
    // Default to tomorrow or today
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now;
  }, [session.scheduledAt]);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<string>("11:30 AM");
  const [notes, setNotes] = useState<string>(session.studentNotes || "");

  const isScheduled = session.status === "scheduled";
  const isRequested = session.status === "requested";
  const hasMeetingUrl = Boolean(session.meetingUrl);

  const confirmMutation = useMutation({
    mutationFn: (payload: { scheduledAt: string; studentNotes?: string }) =>
      mentorshipService.updateSession(session.id, {
        status: "requested",
        scheduledAt: payload.scheduledAt,
        studentNotes: payload.studentNotes?.trim() || null,
      }),
    onSuccess: () => {
      toast.success("1:1 session slot confirmed! Your mentor has been notified.");
      setIsRescheduling(false);
      queryClient.invalidateQueries({ queryKey: ["mentorship-session", session.id] });
      queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to confirm session slot");
    },
  });

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please pick a date and time slot.");
      return;
    }

    // Combine selectedDate + selectedSlot into an ISO string
    const [timeStr, modifier] = selectedSlot.split(" ");
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const finalDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes,
      0,
    );

    confirmMutation.mutate({
      scheduledAt: finalDateTime.toISOString(),
      studentNotes: notes,
    });
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = useMemo(() => {
    const calendarDays = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month days to fill grid of 35 or 42
    const totalSlots = calendarDays.length > 35 ? 42 : 35;
    const remaining = totalSlots - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      calendarDays.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false,
      });
    }

    return calendarDays;
  }, [year, month, daysInMonth, firstDayIndex, prevMonthDays]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isToday = (d: number, m: number, y: number) => {
    const today = new Date();
    return (
      today.getDate() === d &&
      today.getMonth() === m &&
      today.getFullYear() === y
    );
  };

  const isSelected = (d: number, m: number, y: number) => {
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === m &&
      selectedDate.getFullYear() === y
    );
  };

  // Determine if day has available slots (future days or active days)
  const isAvailableDay = (d: number, m: number, y: number) => {
    const target = new Date(y, m, d, 23, 59, 59);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target >= today;
  };

  // Render Confirmed State if scheduled and not rescheduling
  if ((hasMeetingUrl || isScheduled) && !isRescheduling) {
    return (
      <div className="flex flex-col gap-5 rounded-lg border border-emerald-500/30 bg-gradient-to-b from-card via-card to-emerald-500/5 p-6 shadow-xs ring-1 ring-emerald-500/20">
        <div className="flex items-center gap-3 border-b border-border/60 pb-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Video className="size-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              1:1 Mentorship Call
            </h3>
            <p className="text-xs text-muted-foreground">Google Meet Confirmed</p>
          </div>
          <Badge className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </Badge>
        </div>

        <div className="space-y-3 rounded-lg bg-muted/40 p-4 border border-border/60 text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Confirmed Time
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {session.scheduledAt
                ? `${formatDate(session.scheduledAt)} at ${formatTime(session.scheduledAt)}`
                : "Scheduled"}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Senior Mentor
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {mentorName ? `Mentor ${mentorName}` : "Assigned Senior Mentor"}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Duration &amp; Platform
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {session.durationMins || 75} minutes • Google Meet
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {session.meetingUrl && (
            <Button
              render={<a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" />}
              className="w-full rounded-lg py-2.5 font-semibold gap-2 shadow-xs bg-[#1a73e8] hover:bg-[#1557b0] text-white"
            >
              <Video className="size-4" />
              <span>Join Google Meet</span>
              <ExternalLink className="size-3.5 opacity-70" />
            </Button>
          )}

          {!canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRescheduling(true)}
              className="w-full rounded-lg text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>Reschedule Session</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render Booking / Rescheduling View (matching Image 2)
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border/70 bg-card p-6 shadow-xs ring-1 ring-foreground/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <CalendarIcon className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Book a session
            </h3>
            <p className="text-xs text-muted-foreground">Choose a date &amp; time</p>
          </div>
        </div>

        {isRescheduling && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRescheduling(false)}
            className="text-xs h-7 px-2"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Calendar Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-heading text-sm font-bold text-foreground">
            {monthNames[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {days.map((item, idx) => {
            const selected = isSelected(item.day, item.month, item.year);
            const available = isAvailableDay(item.day, item.month, item.year);
            const isCurr = item.isCurrentMonth;

            return (
              <div key={idx} className="flex flex-col items-center py-0.5">
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    const picked = new Date(item.year, item.month, item.day);
                    setSelectedDate(picked);
                  }}
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-full text-xs transition-all",
                    !isCurr && "text-muted-foreground/40",
                    isCurr && !selected && "text-foreground hover:bg-muted/70",
                    !available && "opacity-35 cursor-not-allowed hover:bg-transparent",
                    selected &&
                      "bg-blue-600 text-white font-bold shadow-xs hover:bg-blue-700",
                  )}
                >
                  {item.day}
                </button>
                {/* Dot indicator */}
                <div className="h-1 mt-0.5 flex items-center justify-center">
                  {available && isCurr && !selected && (
                    <span className="size-1 rounded-full bg-blue-500/70" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-1 px-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-600" />
            <span>Available slots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/30" />
            <span>No slots</span>
          </div>
        </div>
      </div>

      {/* Available time slots */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Available time slots
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            <span>IST (GMT+5:30)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_TIME_SLOTS.map((slot) => {
            const active = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-medium transition-all text-center",
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-xs font-semibold"
                    : "border-border/80 bg-background text-foreground hover:bg-muted/50",
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Call notes / agenda */}
      <div className="space-y-1.5 pt-2 border-t border-border/60">
        <label htmlFor="slotNotes" className="text-xs font-medium text-foreground">
          Discussion focus / agenda (optional)
        </label>
        <Textarea
          id="slotNotes"
          placeholder="e.g. Week 1 career audit, resume feedback, role roadmap..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="text-xs resize-none"
        />
      </div>

      {/* Status banner if already requested */}
      {isRequested && (
        <div className="rounded-lg bg-blue-50/80 border border-blue-200/90 p-3 text-xs text-blue-950 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200">
          <p className="font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <Clock className="size-3.5" /> Request Pending Mentor Acceptance
          </p>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1">
            You can change your selected slot above and click Confirm session below to update it.
          </p>
        </div>
      )}

      {mentorCalendlyUrl && (
        <div className="text-center pt-1">
          <a
            href={mentorCalendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 inline-flex items-center gap-1"
          >
            <span>Or book directly via mentor's Calendly</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={confirmMutation.isPending || !selectedDate || !selectedSlot}
        className="w-full rounded-lg py-2.5 font-semibold shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
      >
        {confirmMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            <span>Confirming slot...</span>
          </>
        ) : (
          <span>Confirm session</span>
        )}
      </Button>
    </div>
  );
}
