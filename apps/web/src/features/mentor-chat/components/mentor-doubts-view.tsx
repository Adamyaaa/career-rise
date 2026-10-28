"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessagesSquare,
  Search,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  mentorChatService,
  type ChatThread,
} from "@/services/mentor-chat.service";
import { ChatThreadView } from "./chat-thread-view";
import { cn } from "@/lib/utils";
import { formatTime, formatDate } from "@/lib/format";

export function MentorDoubtsView() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: threads, isLoading } = useQuery({
    queryKey: ["mentor-chat-threads"],
    queryFn: () => mentorChatService.getThreads(),
    refetchInterval: 8000,
  });

  const filteredThreads = (threads || []).filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      t.title.toLowerCase().includes(query) ||
      t.student?.firstName?.toLowerCase().includes(query) ||
      t.student?.lastName?.toLowerCase().includes(query) ||
      t.student?.email.toLowerCase().includes(query)
    );
  });

  // Auto-select first thread on large screens if none selected
  const activeThread = (threads || []).find((t) => t.id === selectedThreadId);

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[500px] rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
      {/* Left List Pane */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-border/70 bg-muted/10",
          selectedThreadId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="p-4 border-b border-border/70 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <MessagesSquare className="size-4.5 text-primary" />
              <span>Student Doubts</span>
            </h2>
            <span className="rounded border border-border/80 bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              {threads?.length || 0}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by student or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        {/* List of Doubts */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <MessagesSquare className="size-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                No doubt threads found.
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              const lastMsg = thread.messages?.[0];

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={cn(
                    "w-full text-left rounded-lg p-3 text-xs transition-all flex flex-col gap-1.5 border shadow-2xs",
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-foreground"
                      : "bg-card border-border/60 hover:bg-muted/50 text-foreground",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs truncate max-w-[170px]">
                      {thread.student?.firstName} {thread.student?.lastName || ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(thread.updatedAt)}
                    </span>
                  </div>

                  <p className="font-medium text-[11px] text-foreground/90 truncate">
                    {thread.title}
                  </p>

                  {lastMsg && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {lastMsg.content}
                    </p>
                  )}

                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="truncate block">
                      {thread.student?.email}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background",
          !selectedThreadId ? "hidden md:flex" : "flex",
        )}
      >
        {selectedThreadId ? (
          <ChatThreadView
            threadId={selectedThreadId}
            onBack={() => setSelectedThreadId(null)}
            isMentorView={true}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-3 bg-muted/5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessagesSquare className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Select a Student Doubt
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose a conversation from the left to view questions, clarify doubts, and chat directly with your mentees.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
