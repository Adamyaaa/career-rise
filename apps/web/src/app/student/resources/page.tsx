"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Search,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  Code2,
  Server,
  GraduationCap,
  FolderTree,
  Share2,
  Maximize2,
  Minimize2,
  Layers,
  BookOpen,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RESOURCE_CATEGORIES,
  DEFAULT_TECHNICAL_NOTES,
  ROOT_DRIVE_FOLDER_ID,
  ROOT_DRIVE_FOLDER_URL,
  extractDriveInfo,
} from "@/features/resources";
import type { ResourceCategory, ResourceNote } from "@/features/resources";
import { toast } from "sonner";

// Mapping topic to thumbnails matching LearnTrackCard aesthetic
function getTopicThumbnailMeta(categoryId: string) {
  switch (categoryId) {
    case "01-programming":
      return {
        gradient: "from-blue-500/20 via-sky-500/15 to-primary/30",
        icon: Code2,
        tag: "CS Fundamentals",
        pattern: "radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
      };
    case "02-ai-ml":
      return {
        gradient: "from-emerald-500/20 via-teal-500/15 to-cyan-600/30",
        icon: Cpu,
        tag: "ML Foundations",
        pattern: "radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
      };
    case "03-genai":
      return {
        gradient: "from-purple-500/20 via-pink-500/15 to-indigo-600/30",
        icon: Sparkles,
        tag: "GenAI & LLMs",
        pattern: "radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
      };
    case "04-agents":
      return {
        gradient: "from-amber-500/20 via-orange-500/15 to-yellow-600/30",
        icon: Zap,
        tag: "Autonomous Agents",
        pattern: "radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
      };
    case "05-system-design":
      return {
        gradient: "from-rose-500/20 via-red-500/15 to-pink-600/30",
        icon: Server,
        tag: "AI System Design",
        pattern: "radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
      };
    case "06-interview":
    default:
      return {
        gradient: "from-indigo-500/20 via-blue-500/15 to-violet-600/30",
        icon: GraduationCap,
        tag: "Interview Prep",
        pattern: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
      };
  }
}

export default function StudentResourcesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"catalog" | "drive_directory">("catalog");
  const [topicSubView, setTopicSubView] = useState<"note" | "folder">("note");

  const notes = DEFAULT_TECHNICAL_NOTES;

  // Selected Category
  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return RESOURCE_CATEGORIES.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId]);

  // Notes in the active category
  const categoryNotes = useMemo(() => {
    if (!selectedCategoryId) return [];
    return notes.filter((n) => n.categoryId === selectedCategoryId);
  }, [notes, selectedCategoryId]);

  // Selected Note
  const activeNote = useMemo(() => {
    if (!selectedNoteId) {
      return categoryNotes[0] || null;
    }
    return notes.find((n) => n.id === selectedNoteId) || categoryNotes[0] || null;
  }, [selectedNoteId, categoryNotes, notes]);

  // Filtered categories/notes for search on main grid
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return RESOURCE_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return RESOURCE_CATEGORIES.filter((cat) => {
      const matchCat =
        cat.label.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.folderName.toLowerCase().includes(q);
      const matchNotes = notes.some(
        (n) =>
          n.categoryId === cat.id &&
          (n.title.toLowerCase().includes(q) ||
            n.description.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))),
      );
      return matchCat || matchNotes;
    });
  }, [searchQuery, notes]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const firstNote = notes.find((n) => n.categoryId === categoryId);
    setSelectedNoteId(firstNote ? firstNote.id : null);
    setTopicSubView("note");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Page Heading */}
      <PageHeading
        title="Technical Notes & Resources"
        description="Handwritten topic-wise revision notes, system design blueprints, and interview preparation materials."
        action={
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            {!selectedCategoryId && (
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                <button
                  onClick={() => setViewMode("catalog")}
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    viewMode === "catalog"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5" />
                  <span>Topic Folders</span>
                </button>
                <button
                  onClick={() => setViewMode("drive_directory")}
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    viewMode === "drive_directory"
                      ? "bg-card text-foreground shadow-2xs text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FolderTree className="size-3.5 text-primary" />
                  <span>Live Drive View</span>
                </button>
              </div>
            )}

            <a
              href={ROOT_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl h-9">
                <FolderOpen className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Open Drive Folder</span>
                <ExternalLink className="size-3 text-muted-foreground" />
              </Button>
            </a>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* VIEW A: INSIDE A SELECTED TOPIC (IN-PAGE READER)                           */}
      {/* ========================================================================= */}
      {activeCategory ? (
        <div className="flex flex-col gap-5">
          {/* Top Breadcrumb & Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedNoteId(null);
                }}
                className="gap-1.5 text-xs rounded-xl cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>All Topics</span>
              </Button>

              <div className="h-4 w-px bg-border/70 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 border",
                    activeCategory.colorScheme.badge,
                  )}
                >
                  {activeCategory.label}
                </Badge>
                <span className="text-xs text-muted-foreground hidden md:inline">
                  Handwritten Notes & Diagrams
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Note Preview vs Folder Embed Switcher */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                <button
                  onClick={() => setTopicSubView("note")}
                  className={cn(
                    "py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    topicSubView === "note"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Document View
                </button>
                <button
                  onClick={() => setTopicSubView("folder")}
                  className={cn(
                    "py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    topicSubView === "folder"
                      ? "bg-card text-foreground shadow-2xs text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Topic Folder
                </button>
              </div>

              {activeNote && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    handleCopyLink(`https://drive.google.com/file/d/${activeNote.driveFileId}/view`)
                  }
                  title="Copy share link"
                  className="size-8"
                >
                  <Share2 className="size-4" />
                </Button>
              )}

              <a
                href={activeCategory.driveFolderUrl || ROOT_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl h-8">
                  <span>Open in Drive</span>
                  <ExternalLink className="size-3" />
                </Button>
              </a>
            </div>
          </div>

          {/* Subview 1: Topic Folder View */}
          {topicSubView === "folder" ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FolderTree className="size-4 text-primary" />
                  <span>Google Drive Folder: {activeCategory.label}</span>
                </span>
              </div>
              <div className="h-[75vh] w-full rounded-xl overflow-hidden border border-border/60 bg-background">
                <iframe
                  src={`https://drive.google.com/embeddedfolderview?id=${ROOT_DRIVE_FOLDER_ID}#list`}
                  title={activeCategory.label}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            /* Subview 2: Document Notes Reader */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Notes in this Topic */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    Available Notes
                  </span>
                  <span>{categoryNotes.length} Total</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {categoryNotes.map((note) => {
                    const isSelected = activeNote?.id === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={cn(
                          "rounded-2xl border p-4 transition-all cursor-pointer flex flex-col gap-2 group",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                            : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "font-semibold text-sm line-clamp-1 transition-colors",
                              isSelected ? "text-primary" : "text-foreground group-hover:text-primary",
                            )}
                          >
                            {note.title}
                          </span>
                          {note.pageCount && (
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {note.pageCount}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {note.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Full Embedded Google Drive Viewer */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                {activeNote ? (
                  <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs flex flex-col">
                    {/* Viewer Subheader */}
                    <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
                      <div className="min-w-0">
                        <h2 className="font-heading font-semibold text-sm sm:text-base text-foreground truncate">
                          {activeNote.title}
                        </h2>
                        <span className="text-xs text-muted-foreground truncate block">
                          Embedded via Google Drive · Interactive Pinch/Zoom & Page Navigation
                        </span>
                      </div>

                      <a
                        href={`https://drive.google.com/file/d/${activeNote.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="xs" className="gap-1 text-xs h-7.5">
                          <span>Fullscreen</span>
                          <ExternalLink className="size-3" />
                        </Button>
                      </a>
                    </div>

                    {/* Iframe Reader */}
                    <div className="h-[78vh] w-full bg-slate-950/5 relative">
                      <iframe
                        src={`https://drive.google.com/file/d/${activeNote.driveFileId}/preview`}
                        title={activeNote.title}
                        width="100%"
                        height="100%"
                        allow="autoplay"
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
                    Select a note from the left to read
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : viewMode === "drive_directory" ? (
        /* ========================================================================= */
        /* VIEW B: DIRECT LIVE GOOGLE DRIVE DIRECTORY EMBED                          */
        /* ========================================================================= */
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                <FolderTree className="size-5 text-primary" />
                <span>Live Google Drive Directory: Hand Written Technical Notes</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse through all 6 subfolders and files live inside Career Rise without sign-in friction.
              </p>
            </div>
            <a
              href={ROOT_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl">
                <span>Open in Native Drive</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          </div>

          <div className="h-[80vh] w-full rounded-xl overflow-hidden border border-border/70 bg-background shadow-inner">
            <iframe
              src={`https://drive.google.com/embeddedfolderview?id=${ROOT_DRIVE_FOLDER_ID}#list`}
              title="Google Drive Full Directory"
              width="100%"
              height="100%"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW C: TOPIC CARDS GRID (DEFAULT - MATCHES LEARNTRACKCARD THEME)         */
        /* ========================================================================= */
        <div className="flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search topics or keywords (e.g., Transformers, Attention, System Design)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl bg-card border-border/70"
            />
          </div>

          {/* Grid of 6 Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredCategories.map((category) => {
              const meta = getTopicThumbnailMeta(category.id);
              const IconComponent = meta.icon;
              const count = notes.filter((n) => n.categoryId === category.id).length;

              return (
                <div
                  key={category.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  {/* 1. Thumbnail Header (Clickable) */}
                  <div
                    onClick={() => handleSelectCategory(category.id)}
                    className={cn(
                      "relative aspect-video w-full overflow-hidden bg-gradient-to-br p-4 flex flex-col justify-between select-none cursor-pointer group/thumb",
                      meta.gradient,
                    )}
                    style={{ backgroundImage: meta.pattern }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                    {/* Top Badges Row */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-2xs">
                        {meta.tag}
                      </span>
                    </div>

                    {/* Center Aesthetic Topic Icon */}
                    <div className="relative z-10 my-auto flex items-center justify-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-background/60 backdrop-blur-md shadow-xs ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                        <IconComponent className="size-7 text-foreground/80" />
                      </div>
                    </div>

                    {/* Bottom Metadata Badges */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
                        <BookOpen className="size-3" />
                        {count} {count === 1 ? "note document" : "note documents"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Card Content Body */}
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-4">
                    <div className="flex flex-col gap-2">
                      <div
                        onClick={() => handleSelectCategory(category.id)}
                        className="cursor-pointer"
                      >
                        <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {category.label}
                        </h3>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <FolderOpen className="size-3 text-primary/80" />
                        <span className="truncate">Handwritten notes & diagrams</span>
                      </div>
                    </div>

                    {/* 3. Card Footer Action */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleSelectCategory(category.id)}
                        className="w-full rounded-xl gap-2 font-medium shadow-xs cursor-pointer"
                      >
                        <span>View Topic Notes</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
