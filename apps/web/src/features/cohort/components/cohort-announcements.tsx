"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { announcementsService, type Announcement } from "@/services/announcements.service";
import { fullName, formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

const emptyDraft = { title: "", content: "", link: "" };

// One component for both sides: students get the same list without the controls.
export function CohortAnnouncements({ cohortId, canManage }: { cohortId: string; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Announcement | "new" | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["cohort-announcements", cohortId],
    queryFn: () => announcementsService.list(cohortId),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cohort-announcements", cohortId] });

  const openNew = () => {
    setDraft(emptyDraft);
    setEditing("new");
  };

  const openEdit = (announcement: Announcement) => {
    setDraft({
      title: announcement.title,
      content: announcement.content,
      link: announcement.link ?? "",
    });
    setEditing(announcement);
  };

  const save = useMutation({
    mutationFn: () => {
      const input = {
        title: draft.title.trim(),
        content: draft.content.trim(),
        // Always sent so clearing the field removes an existing link.
        link: draft.link.trim(),
      };
      return editing === "new" || editing === null
        ? announcementsService.create(cohortId, input)
        : announcementsService.update(editing.id, input);
    },
    onSuccess: () => {
      refresh();
      toast.success(editing === "new" ? "Announcement posted" : "Announcement updated");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't save that — try again"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => announcementsService.delete(id),
    onSuccess: () => {
      refresh();
      toast.success("Announcement deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that"),
  });

  const handleDelete = (announcement: Announcement) => {
    if (confirm(`Delete "${announcement.title}"? This cannot be undone.`)) remove.mutate(announcement.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New announcement
          </Button>
        </div>
      )}

      {announcements?.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description={
            canManage
              ? "Post an update and everyone in this cohort will see it here."
              : "Updates from your mentor will show up here."
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {/* Deliberately a step up from the body text so each post reads as a
                      headline rather than a wall of uniform text. */}
                  <h3 className="font-heading text-base leading-snug font-semibold text-foreground">
                    {announcement.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {fullName(announcement.author)} · {formatRelativeTime(announcement.createdAt)}
                  </p>
                </div>

                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(announcement)}
                      aria-label={`Edit ${announcement.title}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(announcement)}
                      disabled={remove.isPending}
                      className="text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${announcement.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Preserves the line breaks the author typed. */}
              <p className="text-sm whitespace-pre-line text-foreground">{announcement.content}</p>

              {announcement.link && (
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 rounded-md text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Open link
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "New announcement" : "Edit announcement"}</DialogTitle>
          </DialogHeader>

          <FormField label="Topic" htmlFor="announcementTitle">
            <Input
              id="announcementTitle"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. No class this Friday"
            />
          </FormField>

          <FormField label="Content" htmlFor="announcementContent">
            <Textarea
              id="announcementContent"
              rows={5}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="What does the cohort need to know?"
            />
          </FormField>

          <FormField label="Link (optional)" htmlFor="announcementLink">
            <Input
              id="announcementLink"
              type="url"
              value={draft.link}
              onChange={(e) => setDraft({ ...draft, link: e.target.value })}
              placeholder="https://drive.google.com/..."
            />
          </FormField>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !draft.title.trim() || !draft.content.trim()}
            >
              {editing === "new" ? "Post" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
