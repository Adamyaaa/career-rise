"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Loader2,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  mentorChatService,
  type ChatThread,
  type ChatMessage,
} from "@/services/mentor-chat.service";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { formatTime, formatDate } from "@/lib/format";
import { toast } from "sonner";

interface ChatThreadViewProps {
  threadId: string;
  onBack?: () => void;
  isMentorView?: boolean;
}

export function ChatThreadView({
  threadId,
  onBack,
  isMentorView = false,
}: ChatThreadViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ["mentor-chat-thread", threadId],
    queryFn: () => mentorChatService.getThreadById(threadId),
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      mentorChatService.sendMessage(threadId, content),
    onSuccess: () => {
      setInputText("");
      queryClient.invalidateQueries({ queryKey: ["mentor-chat-thread", threadId] });
      queryClient.invalidateQueries({ queryKey: ["mentor-chat-threads"] });
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSend = () => {
    if (!inputText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Thread not found.
      </div>
    );
  }

  const otherPersonName = isMentorView
    ? `${thread.student?.firstName || "Student"} ${thread.student?.lastName || ""}`
    : thread.mentor
      ? `${thread.mentor.firstName || "Mentor"} ${thread.mentor.lastName || ""}`
      : "Mentor";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 p-3.5 bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onBack}
              className="shrink-0 size-7 rounded-md"
              aria-label="Back to threads"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <div className="min-w-0">
            <span className="font-semibold text-xs text-foreground truncate block max-w-[260px]">
              {otherPersonName}
            </span>
            <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">
              {thread.title}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {thread.messages?.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const senderIsMentor = msg.sender?.role === "MENTOR" || msg.sender?.role === "SUPER_ADMIN";

          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1 max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                {!isMe && senderIsMentor && (
                  <ShieldCheck className="size-3 text-primary shrink-0" />
                )}
                <span>{isMe ? "You" : msg.sender?.firstName || "Mentor"}</span>
                <span>•</span>
                <span>{formatTime(msg.createdAt)}</span>
              </div>

              <div
                className={cn(
                  "rounded-lg px-3.5 py-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words border",
                  isMe
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 border-border/70 text-foreground",
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="border-t border-border/70 p-3 bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or doubt... (Press Enter to send)"
            rows={2}
            className="text-xs resize-none min-h-[46px] max-h-32 rounded-md"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputText.trim() || sendMutation.isPending}
            className="size-9 p-0 shrink-0 rounded-md"
            aria-label="Send message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
