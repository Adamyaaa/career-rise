"use client";

import { useMemo, useState } from "react";
import {
  FolderOpen,
  Search,
  ExternalLink,
  FileText,
  Sparkles,
  BookOpen,
  Layers,
  X,
  Maximize2,
  Minimize2,
  Share2,
  Tag,
  CheckCircle2,
  ArrowRight,
  FolderTree,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useResourcesStore } from "../stores/resources-store";
import {
  RESOURCE_CATEGORIES,
  ROOT_DRIVE_FOLDER_ID,
  ROOT_DRIVE_FOLDER_URL,
} from "../data/resources-data";
import { DriveEmbedViewer } from "./drive-embed-viewer";
import { AddNoteDialog } from "./add-note-dialog";
import { cn } from "@/lib/utils";

export function ResourcesSidePanel() {
  const {
    isOpen,
    close,
    activeNoteId,
    setActiveNoteId,
    activeCategoryId,
    setActiveCategoryId,
    searchQuery,
    setSearchQuery,
    isMaximized,
    toggleMaximized,
    notes,
    addCustomNote,
    removeCustomNote,
  } = useResourcesStore();

  const [viewMode, setViewMode] = useState<"catalog" | "drive_folder">("catalog");

  // Current active note (if any selected for preview)
  const activeNote = useMemo(() => {
    if (!activeNoteId) return null;
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [activeNoteId, notes]);

  const activeCategory = useMemo(() => {
    if (!activeNote) return undefined;
    return RESOURCE_CATEGORIES.find((c) => c.id === activeNote.categoryId);
  }, [activeNote]);

  const currentCategoryObj = useMemo(() => {
    return RESOURCE_CATEGORIES.find((c) => c.id === activeCategoryId);
  }, [activeCategoryId]);

  const currentFolderUrl = currentCategoryObj?.driveFolderUrl || ROOT_DRIVE_FOLDER_URL;
  const currentFolderId = currentCategoryObj?.driveFolderId || ROOT_DRIVE_FOLDER_ID;
  const currentFolderName = currentCategoryObj?.folderName || "Hand Written Technical Notes";

  // Filter notes based on active category and search query
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Category match
      if (activeCategoryId !== "all" && note.categoryId !== activeCategoryId) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesDesc = note.description.toLowerCase().includes(q);
        const matchesTags = note.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [notes, activeCategoryId, searchQuery]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "p-0 flex flex-col gap-0 shadow-2xl border-l border-border/70 transition-all duration-300",
          isMaximized
            ? "w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl 2xl:max-w-6xl"
            : "w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
        )}
      >
        {activeNote ? (
          /* ================= ACTIVE EMBEDDED NOTE PREVIEW ================= */
          <DriveEmbedViewer
            note={activeNote}
            category={activeCategory}
            isMaximized={isMaximized}
            onBack={() => setActiveNoteId(null)}
            onToggleMaximize={toggleMaximized}
            onDeleteCustom={() => removeCustomNote(activeNote.id)}
          />
        ) : (
          /* ================= CATALOG & BROWSER VIEW ================= */
          <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <SheetHeader className="border-b border-border/70 bg-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <FolderOpen className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base font-bold text-foreground truncate flex items-center gap-2">
                      <span>Technical Notes & Resources</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Zero Storage Cost
                      </span>
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      Handwritten topic-wise notes, system design blueprints & interview cheat sheets
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <AddNoteDialog onAddNote={addCustomNote} defaultCategoryId={activeCategoryId} />

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={toggleMaximized}
                    title={isMaximized ? "Restore size" : "Expand width"}
                    className="size-8 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isMaximized ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={close}
                    aria-label="Close resources panel"
                    className="size-8 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* View Mode Switcher + Drive External Link */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 flex-1 sm:max-w-md">
                  <button
                    onClick={() => setViewMode("catalog")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      viewMode === "catalog"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FileText className="size-3.5" />
                    <span>Topic Notes ({notes.length})</span>
                  </button>
                  <button
                    onClick={() => setViewMode("drive_folder")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      viewMode === "drive_folder"
                        ? "bg-card text-foreground shadow-2xs text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FolderTree className="size-3.5 text-primary" />
                    <span>Live Drive Folder</span>
                  </button>
                </div>

                <a
                  href={ROOT_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium hover:underline px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <span>Open Folder in Drive</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </SheetHeader>

            {/* View Mode: Live Google Drive Folder Embed */}
            {viewMode === "drive_folder" ? (
              <div className="flex-1 flex flex-col bg-muted/10 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="size-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Live Directory: Hand Written Technical Notes
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setViewMode("catalog")}
                    className="text-xs cursor-pointer h-7"
                  >
                    Back to Notes
                  </Button>
                </div>
                <div className="flex-1 rounded-xl border border-border/80 overflow-hidden bg-background shadow-xs">
                  <iframe
                    src={`https://drive.google.com/embeddedfolderview?id=${ROOT_DRIVE_FOLDER_ID}#list`}
                    title="Google Drive Folder"
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              /* View Mode: Organized Catalog of Handwritten Notes */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-border/60 bg-card/60">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search handwritten notes (e.g., Transformers, Attention, System Design, DSA)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8 text-xs h-9 bg-background"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Topic Filter Pills (Matching the 6 folders in screenshot) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
                    <button
                      onClick={() => setActiveCategoryId("all")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                        activeCategoryId === "all"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      All Notes ({notes.length})
                    </button>

                    {RESOURCE_CATEGORIES.map((cat) => {
                      const count = notes.filter((n) => n.categoryId === cat.id).length;
                      const isActive = activeCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategoryId(cat.id)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                              : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <span>{cat.numberPrefix}.</span>
                          <span>{cat.label}</span>
                          <span
                            className={cn(
                              "text-[10px] px-1 rounded-full",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-background text-muted-foreground",
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredNotes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/10 my-6">
                      <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileText className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">
                          No notes found matching your criteria
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Try searching for a different keyword or paste a new Google Drive link using the &quot;Add Note Link&quot; button.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredNotes.map((note) => {
                        const cat = RESOURCE_CATEGORIES.find((c) => c.id === note.categoryId);

                        return (
                          <div
                            key={note.id}
                            className="rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-xs group flex flex-col gap-2.5"
                          >
                            {/* Card Top Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {cat && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] font-semibold px-2 py-0.5 border",
                                      cat.colorScheme.badge,
                                    )}
                                  >
                                    {cat.numberPrefix} · {cat.label}
                                  </Badge>
                                )}

                                {note.pageCount && (
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                    {note.pageCount}
                                  </span>
                                )}

                                {note.isHandwritten && (
                                  <span className="text-[10px] text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Sparkles className="size-2.5" /> Handwritten
                                  </span>
                                )}
                              </div>

                              <a
                                href={`https://drive.google.com/file/d/${note.driveFileId}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open original document in Google Drive"
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>
                            </div>

                            {/* Card Content */}
                            <div>
                              <h3
                                onClick={() => setActiveNoteId(note.id)}
                                className="font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
                              >
                                {note.title}
                              </h3>
                              {note.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {note.description}
                                </p>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* Action Button */}
                            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">
                                {note.relevance === "interviews_only"
                                  ? "Interview Prep Focus"
                                  : note.relevance === "core_fundamentals"
                                  ? "CS Fundamentals"
                                  : "Cohort Syllabus Companion"}
                              </span>

                              <Button
                                size="sm"
                                onClick={() => setActiveNoteId(note.id)}
                                className="rounded-lg text-xs font-medium gap-1.5 h-7.5 px-3 cursor-pointer"
                              >
                                <span>Read Note</span>
                                <ArrowRight className="size-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
