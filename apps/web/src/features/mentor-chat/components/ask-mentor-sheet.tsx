"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Plus,
  ChevronRight,
  Clock,
  MessagesSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { FormField } from "@/components/common/form-field";
import {
  mentorChatService,
  type ChatThread,
} from "@/services/mentor-chat.service";
import { ChatThreadView } from "./chat-thread-view";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import { toast } from "sonner";

export function AskMentorSheet() {
  const [open, setOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isAskingNew, setIsAskingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const queryClient = useQueryClient();

  // Queries
  const { data: mentorInfo } = useQuery({
    queryKey: ["student-mentor-info"],
    queryFn: () => mentorChatService.getStudentMentor(),
    enabled: open,
  });

  const { data: threads, isLoading: loadingThreads } = useQuery({
    queryKey: ["mentor-chat-threads"],
    queryFn: () => mentorChatService.getThreads(),
    enabled: open,
    refetchInterval: 10000,
  });

  // Create thread mutation
  const createMutation = useMutation({
    mutationFn: () =>
      mentorChatService.createThread({
        title: newTitle.trim() || undefined,
        initialMessage: newMessage.trim(),
        mentorId: mentorInfo?.mentor?.id,
      }),
    onSuccess: (newThread) => {
      toast.success("Question submitted to your mentor!");
      setNewTitle("");
      setNewMessage("");
      setIsAskingNew(false);
      queryClient.invalidateQueries({ queryKey: ["mentor-chat-threads"] });
      if (newThread?.id) {
        setSelectedThreadId(newThread.id);
      }
    },
    onError: () => {
      toast.error("Failed to submit question. Please try again.");
    },
  });

  const handleStartNewDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || createMutation.isPending) return;
    createMutation.mutate();
  };

  const totalThreadsCount = threads?.length || 0;
  const mentorName = mentorInfo?.mentor
    ? `${mentorInfo.mentor.firstName || "Mentor"} ${mentorInfo.mentor.lastName || ""}`.trim()
    : "Senior Mentor";

  return (
    <>
      {/* Floating Action Button on Student Dashboard */}
      <div className="fixed bottom-6 right-6 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            nativeButton
            render={
              <Button
                className="rounded-lg shadow-md h-10 px-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-medium border border-primary/30"
                aria-label="Ask a mentor"
              />
            }
          >
            <MessagesSquare className="size-4.5" />
            <span className="font-medium text-xs sm:text-sm">Ask a Mentor</span>
            {totalThreadsCount > 0 && (
              <span className="flex size-4.5 items-center justify-center rounded bg-background text-foreground text-[10px] font-bold">
                {totalThreadsCount}
              </span>
            )}
          </SheetTrigger>

          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col gap-0 shadow-2xl border-l border-border/70"
          >
            {/* Sheet Top Header */}
            <SheetHeader className="p-4 sm:p-5 border-b border-border/70 bg-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground border border-border/70">
                    <MessagesSquare className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-sm font-semibold text-foreground truncate">
                      Ask a Mentor
                    </SheetTitle>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Direct 1:1 Q&A and doubt clearance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!selectedThreadId && !isAskingNew && (
                    <Button
                      size="sm"
                      onClick={() => setIsAskingNew(true)}
                      className="rounded-md text-xs font-medium gap-1.5 h-7.5 px-3"
                    >
                      <Plus className="size-3.5" />
                      <span>New Doubt</span>
                    </Button>
                  )}

                  <SheetClose
                    nativeButton
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        aria-label="Close sheet"
                      />
                    }
                  >
                    <X className="size-4" />
                  </SheetClose>
                </div>
              </div>

              {/* Assigned Mentor Callout Banner */}
              {mentorInfo?.mentor && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {mentorName}
                      </span>
                      <span className="text-muted-foreground ml-1.5">
                        {mentorInfo.source === "pro_track" ? "• 1:1 Pro Mentor" : "• Cohort Mentor"}
                      </span>
                    </div>
                  </div>
                  <span className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Active
                  </span>
                </div>
              )}
            </SheetHeader>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedThreadId ? (
                /* 1. Inside a Conversation Thread */
                <ChatThreadView
                  threadId={selectedThreadId}
                  onBack={() => setSelectedThreadId(null)}
                />
              ) : isAskingNew ? (
                /* 2. Form to Ask a New Doubt */
                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-4 text-primary" /> Ask a New Question
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setIsAskingNew(false)}
                      className="size-7"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleStartNewDoubt} className="space-y-4">
                    <FormField label="Topic / Title (Optional)" htmlFor="doubtTitle">
                      <Input
                        id="doubtTitle"
                        placeholder="e.g. Question on resume bullet points"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-xs"
                      />
                    </FormField>

                    <FormField label="Your Doubt / Question *" htmlFor="doubtMsg">
                      <Textarea
                        id="doubtMsg"
                        required
                        rows={5}
                        placeholder="Explain your doubt, context, or code problem in detail. Your mentor will reply directly here."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="text-xs leading-relaxed resize-none"
                      />
                    </FormField>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAskingNew(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newMessage.trim() || createMutation.isPending}
                        className="rounded-md text-xs font-medium gap-1.5 px-4"
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin mr-1" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                        <span>Submit Question</span>
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* 3. Thread List View */
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Your Doubt Threads
                    </span>
                    <span>{threads?.length || 0} Total</span>
                  </div>

                  {loadingThreads ? (
                    <div className="flex h-36 items-center justify-center">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : !threads || threads.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/10">
                      <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-muted text-foreground border border-border/70">
                        <MessagesSquare className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">
                          No doubts asked yet
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Have questions on class materials, interview prep, or code? Ask your mentor anytime.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setIsAskingNew(true)}
                        className="rounded-md text-xs font-medium gap-1.5 mt-2"
                      >
                        <Plus className="size-3.5" /> Ask a Question
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {threads.map((thread) => {
                        const lastMsg = thread.messages?.[0];

                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => setSelectedThreadId(thread.id)}
                            className="w-full text-left rounded-lg border border-border/70 bg-card p-3 transition-all hover:bg-muted/40 hover:border-border flex items-start justify-between gap-3 shadow-2xs group"
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="font-semibold text-xs text-foreground truncate block max-w-[240px]">
                                {thread.title}
                              </span>

                              {lastMsg && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {lastMsg.content}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                                <Clock className="size-3" />
                                <span>{formatTime(thread.updatedAt)}</span>
                              </div>
                            </div>

                            <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-2 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
