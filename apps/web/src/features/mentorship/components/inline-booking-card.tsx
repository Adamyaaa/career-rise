"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  CheckCircle2,
  Loader2,
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
  availableSlots?: string[] | null;
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

function parseSlotToDate(date: Date, slotStr: string): Date {
  const trimmed = slotStr.trim();
  const parts = trimmed.split(/\s+/);
  const timePart = parts[0] || "10:00";
  const modifier = parts[1]?.toUpperCase();

  const [hoursStr, minutesStr] = timePart.split(":");
  let hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;

  if (modifier === "PM" && hours < 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

function isSlotInPast(slotStr: string, date: Date): boolean {
  if (!slotStr || !date) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Past day
  if (targetDay.getTime() < today.getTime()) {
    return true;
  }
  // Future day
  if (targetDay.getTime() > today.getTime()) {
    return false;
  }

  // Same day: slot is past if its time <= current time
  const slotDate = parseSlotToDate(date, slotStr);
  return slotDate.getTime() <= now.getTime();
}

export function InlineBookingCard({
  session,
  mentorName,
  availableSlots,
  canManage = false,
}: InlineBookingCardProps) {
  const queryClient = useQueryClient();

  // If already scheduled with a meeting link, allow toggling reschedule mode
  const [isRescheduling, setIsRescheduling] = useState(false);

  const timeSlots = useMemo(() => {
    if (Array.isArray(availableSlots) && availableSlots.length > 0) {
      return availableSlots;
    }
    return DEFAULT_TIME_SLOTS;
  }, [availableSlots]);

  // Parse existing scheduledAt date if present and in the future; otherwise default to today (if slots remain) or tomorrow
  const initialDate = useMemo(() => {
    if (session.scheduledAt) {
      const d = new Date(session.scheduledAt);
      if (!isNaN(d.getTime()) && d.getTime() > Date.now()) return d;
    }

    const now = new Date();
    const hasRemainingToday = timeSlots.some((s) => !isSlotInPast(s, now));
    if (hasRemainingToday) {
      return now;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, [session.scheduledAt, timeSlots]);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [notes, setNotes] = useState<string>(session.studentNotes || "");

  // Available slots for selected date, checking against current time
  const availableSlotsForSelectedDate = useMemo(() => {
    return timeSlots.map((slot) => ({
      slot,
      isPast: isSlotInPast(slot, selectedDate),
    }));
  }, [timeSlots, selectedDate]);

  // Auto-select the first non-past slot whenever selected date or slot list changes
  useEffect(() => {
    const isCurrentSlotPast = isSlotInPast(selectedSlot, selectedDate);
    if (!selectedSlot || isCurrentSlotPast || !timeSlots.includes(selectedSlot)) {
      const firstValid = availableSlotsForSelectedDate.find((s) => !s.isPast);
      setSelectedSlot(firstValid ? firstValid.slot : "");
    }
  }, [selectedDate, availableSlotsForSelectedDate, selectedSlot, timeSlots]);

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
      toast.success("1:1 session slot requested! Your mentor has been notified.");
      setIsRescheduling(false);
      queryClient.invalidateQueries({ queryKey: ["mentorship-session", session.id] });
      queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-mentorship-dashboard"] });
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

    if (isSlotInPast(selectedSlot, selectedDate)) {
      toast.error("This time slot has already passed. Please select an upcoming slot.");
      return;
    }

    const finalDateTime = parseSlotToDate(selectedDate, selectedSlot);
    if (finalDateTime.getTime() <= Date.now()) {
      toast.error("This time slot has already passed. Please choose a future time.");
      return;
    }

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

  const isSelected = (d: number, m: number, y: number) => {
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === m &&
      selectedDate.getFullYear() === y
    );
  };

  // Determine if day has available slots (future days or active days with remaining future slots)
  const isAvailableDay = (d: number, m: number, y: number) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(y, m, d);

    if (targetDay.getTime() < today.getTime()) {
      return false;
    }

    if (targetDay.getTime() === today.getTime()) {
      return timeSlots.some((slot) => !isSlotInPast(slot, targetDay));
    }

    return true;
  };

  // Render Confirmed State if scheduled and not rescheduling
  if ((hasMeetingUrl || isScheduled) && !isRescheduling) {
    return (
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-xs ring-1 ring-foreground/5">
        <div className="flex items-center gap-3 border-b border-border/60 pb-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
              Google Meet Link
            </span>
            {session.meetingUrl ? (
              <p className="mt-0.5">
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline break-all"
                >
                  {session.meetingUrl}
                </a>
              </p>
            ) : (
              <p className="text-muted-foreground mt-0.5">Meeting link being configured</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {session.meetingUrl && (
            <Button
              render={<a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" />}
              className="w-full rounded-lg py-2.5 font-semibold gap-2 shadow-xs bg-[#1a73e8] hover:bg-[#1557b0] text-white"
            >
              <Video className="size-4" />
              <span>Join Google Meet Call</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsRescheduling(true)}
            className="w-full rounded-lg text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Request to Reschedule Slot</span>
          </Button>
        </div>
      </div>
    );
  }

  // Render Booking / Rescheduling View
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-xs ring-1 ring-foreground/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
            <CalendarIcon className="size-4" />
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
                    isCurr && !selected && "text-foreground hover:bg-muted/70 cursor-pointer",
                    !available && "opacity-35 cursor-not-allowed hover:bg-transparent text-muted-foreground/50",
                    selected &&
                      "bg-foreground text-background font-bold shadow-xs hover:bg-foreground/90",
                  )}
                >
                  {item.day}
                </button>
                {/* Dot indicator */}
                <div className="h-1 mt-0.5 flex items-center justify-center">
                  {available && isCurr && !selected && (
                    <span className="size-1 rounded-full bg-foreground/50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-1 px-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground" />
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
          {availableSlotsForSelectedDate.map(({ slot, isPast }) => {
            const active = selectedSlot === slot && !isPast;
            return (
              <button
                key={slot}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "rounded-lg border py-2.5 px-3 text-xs font-medium transition-all text-center flex items-center justify-between",
                  isPast &&
                    "opacity-40 cursor-not-allowed bg-muted/20 text-muted-foreground border-border/50",
                  !isPast &&
                    active &&
                    "border-foreground bg-foreground text-background shadow-xs font-semibold",
                  !isPast &&
                    !active &&
                    "border-border/80 bg-background text-foreground hover:bg-muted/50 cursor-pointer",
                )}
              >
                <span className={cn(isPast && "line-through")}>{slot}</span>
                {isPast ? (
                  <span className="text-[10px] font-normal text-muted-foreground">Passed</span>
                ) : active ? (
                  <CheckCircle2 className="size-3.5 text-background" />
                ) : null}
              </button>
            );
          })}
        </div>

        {availableSlotsForSelectedDate.every((s) => s.isPast) && (
          <div className="rounded-lg bg-muted/40 border border-border/70 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              All slots for this day have passed
            </p>
            <p className="text-[11px] text-muted-foreground">
              Please choose tomorrow or another upcoming date on the calendar above.
            </p>
          </div>
        )}
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
        <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs">
          <p className="font-semibold flex items-center gap-1.5 text-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>Request Pending Mentor Acceptance</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            You can change your selected slot above and click Confirm session below to update it.
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={
          confirmMutation.isPending ||
          !selectedDate ||
          !selectedSlot ||
          isSlotInPast(selectedSlot, selectedDate)
        }
        className="w-full rounded-lg py-2.5 font-semibold shadow-xs"
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
