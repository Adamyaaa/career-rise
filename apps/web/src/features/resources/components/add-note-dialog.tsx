"use client";

import { useState } from "react";
import { Plus, Link2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import {
  RESOURCE_CATEGORIES,
  extractDriveInfo,
} from "../data/resources-data";
import type { ResourceCategoryId, ResourceNote } from "../types/resource.types";
import { toast } from "sonner";

interface AddNoteDialogProps {
  onAddNote: (note: Omit<ResourceNote, "id" | "customAdded">) => void;
  defaultCategoryId?: string;
}

export function AddNoteDialog({ onAddNote, defaultCategoryId }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [categoryId, setCategoryId] = useState<ResourceCategoryId>(
    (defaultCategoryId && defaultCategoryId !== "all"
      ? defaultCategoryId
      : "03-genai") as ResourceCategoryId,
  );
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [pageCount, setPageCount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !driveUrl.trim()) {
      toast.error("Please provide both a Title and a Google Drive URL / ID");
      return;
    }

    const driveInfo = extractDriveInfo(driveUrl.trim());

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onAddNote({
      title: title.trim(),
      categoryId,
      driveFileId: driveInfo.id,
      description: description.trim() || "Handwritten notes document.",
      tags: tags.length > 0 ? tags : ["Notes", "Technical"],
      isHandwritten: true,
      pageCount: pageCount.trim() ? `${pageCount.trim()} pages` : undefined,
      relevance: "cohort_and_interviews",
    });

    toast.success("Note added successfully to Resources!");
    setOpen(false);

    // Reset form
    setTitle("");
    setDriveUrl("");
    setDescription("");
    setTagsInput("");
    setPageCount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton
        render={
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Plus className="size-3.5" />
            <span>Add Note Link</span>
          </Button>
        }
      />

      <DialogContent className="max-w-lg p-5">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Link2 className="size-4.5 text-primary" />
            <span>Add Google Drive Note Link</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Paste any Google Drive file or folder link. It will be embedded directly without cloud storage costs.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <FormField label="Note Title *" htmlFor="noteTitle">
            <Input
              id="noteTitle"
              required
              placeholder="e.g. KV Cache & Multi-Query Attention Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
            />
          </FormField>

          <FormField label="Google Drive Link or File ID *" htmlFor="driveUrl">
            <Input
              id="driveUrl"
              required
              placeholder="https://drive.google.com/file/d/1TeP9ugXJ8Qc.../view"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Supports full Drive share URLs (drive.google.com/file/d/...) or raw file IDs
            </p>
          </FormField>

          <FormField label="Category / Topic *" htmlFor="noteCat">
            <select
              id="noteCat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as ResourceCategoryId)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground">
                  {cat.numberPrefix} · {cat.label} ({cat.folderName})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tags (comma-separated)" htmlFor="noteTags">
              <Input
                id="noteTags"
                placeholder="LLM, Attention, Math"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="text-xs"
              />
            </FormField>

            <FormField label="Est. Pages" htmlFor="notePages">
              <Input
                id="notePages"
                placeholder="e.g. 14"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="text-xs"
              />
            </FormField>
          </div>

          <FormField label="Description / Summary (Optional)" htmlFor="noteDesc">
            <Textarea
              id="noteDesc"
              rows={2}
              placeholder="Brief summary of what formulas, diagrams, or questions this note covers."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 text-xs">
              <Sparkles className="size-3.5" />
              <span>Save to Resources</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
