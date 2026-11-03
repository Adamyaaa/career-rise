"use client";

import { useState, useMemo } from "react";
import {
  FolderOpen,
  FileText,
  Search,
  ExternalLink,
  Sparkles,
  Zap,
  Cpu,
  Code2,
  Server,
  GraduationCap,
  FolderTree,
  ArrowUpRight,
  X,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RESOURCE_CATEGORIES,
  TECHNICAL_NOTES,
  ROOT_DRIVE_FOLDER_URL,
} from "@/features/resources";
import type { ResourceCategory, ResourceNote } from "@/features/resources";

function getCategoryIcon(iconName: ResourceCategory["iconName"]) {
  switch (iconName) {
    case "Code2":
      return Code2;
    case "Cpu":
      return Cpu;
    case "Sparkles":
      return Sparkles;
    case "Zap":
      return Zap;
    case "Server":
      return Server;
    case "GraduationCap":
    default:
      return GraduationCap;
  }
}

export default function StudentResourcesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return TECHNICAL_NOTES;
    const q = searchQuery.toLowerCase();
    return TECHNICAL_NOTES.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  // Group notes by folder/category
  const visibleCategories = useMemo(() => {
    const categories =
      selectedFolderId === "all"
        ? RESOURCE_CATEGORIES
        : RESOURCE_CATEGORIES.filter((c) => c.id === selectedFolderId);

    return categories
      .map((cat) => {
        const catNotes = filteredNotes.filter((n) => n.categoryId === cat.id);
        return {
          ...cat,
          notes: catNotes,
        };
      })
      .filter((cat) => cat.notes.length > 0 || !searchQuery.trim());
  }, [selectedFolderId, filteredNotes, searchQuery]);

  const totalFilesCount = TECHNICAL_NOTES.length;

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* 1. Page Heading */}
      <PageHeading
        title="Technical Notes & Resources"
        description="Comprehensive handwritten notes, core CS blueprints, and interview guides organized by topic folder."
      />

      {/* 2. Search & Folder Filter Bar */}
      <div className="flex flex-col gap-3.5">
        {/* Search input */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by keyword (e.g. LangChain, Transformers, DSA, System Design)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-9 h-10 text-xs rounded-xl bg-card border-border/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Folder Navigation Tabs (Wrapping into multi-row so all are visible) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={() => setSelectedFolderId("all")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
              selectedFolderId === "all"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <FolderOpen className="size-3.5" />
            <span>All Folders</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                selectedFolderId === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground",
              )}
            >
              {totalFilesCount}
            </span>
          </button>

          {RESOURCE_CATEGORIES.map((cat) => {
            const count = TECHNICAL_NOTES.filter((n) => n.categoryId === cat.id).length;
            const isSelected = selectedFolderId === cat.id;
            const Icon = getCategoryIcon(cat.iconName);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFolderId(cat.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isSelected
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

      {/* 3. Folder & File Directory Architecture */}
      <div className="flex flex-col gap-8 mt-2">
        {visibleCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3 bg-muted/10 my-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">
                No files found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for a different keyword or choose &quot;All Folders&quot; to see all available notes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedFolderId("all");
              }}
              className="text-xs"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          visibleCategories.map((category) => {
            const Icon = getCategoryIcon(category.iconName);

            return (
              <section key={category.id} className="flex flex-col gap-4">
                {/* Folder Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border shrink-0",
                        category.colorScheme.bg,
                        category.colorScheme.border,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-foreground">
                        {category.label}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium shrink-0 self-start sm:self-center">
                    {category.notes.length} {category.notes.length === 1 ? "file" : "files"}
                  </span>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.notes.map((file) => (
                    <a
                      key={file.id}
                      href={file.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer select-none"
                    >
                      <div className="flex flex-col gap-2">
                        {/* File Top Bar */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                            <FileText className="size-4" />
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            <span>Open Drive</span>
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                            {file.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {file.description}
                          </p>
                        </div>
                      </div>

                      {/* File Tags Footer */}
                      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                        {file.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
