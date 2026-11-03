"use client";

import { useState } from "react";
import {
  ExternalLink,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Share2,
  Info,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ResourceNote, ResourceCategory } from "../types/resource.types";
import { extractDriveInfo } from "../data/resources-data";

interface DriveEmbedViewerProps {
  note: ResourceNote;
  category?: ResourceCategory;
  isMaximized: boolean;
  onBack: () => void;
  onToggleMaximize: () => void;
  onDeleteCustom?: () => void;
}

export function DriveEmbedViewer({
  note,
  category,
  isMaximized,
  onBack,
  onToggleMaximize,
  onDeleteCustom,
}: DriveEmbedViewerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const driveInfo = extractDriveInfo(note.driveFileId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveInfo.directUrl);
    toast.success("Google Drive link copied to clipboard");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="size-4" />
            <span>All Notes</span>
          </Button>

          <div className="h-4 w-px bg-border/80 hidden sm:block" />

          {category && (
            <Badge
              variant="outline"
              className={`hidden sm:inline-flex text-[11px] font-medium border ${category.colorScheme.border} ${category.colorScheme.bg}`}
            >
              {category.numberPrefix} · {category.label}
            </Badge>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleCopyLink}
            title="Copy Drive link"
            className="h-8 gap-1 text-xs"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <a
            href={driveInfo.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
            title="Open original file in Google Drive"
          >
            <Button variant="outline" size="xs" className="h-8 gap-1.5 text-xs text-primary">
              <ExternalLink className="size-3.5" />
              <span>Drive</span>
            </Button>
          </a>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleMaximize}
            title={isMaximized ? "Restore size" : "Expand panel width"}
            className="size-8"
          >
            {isMaximized ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>

          {note.customAdded && onDeleteCustom && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDeleteCustom}
              title="Delete custom note"
              className="size-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Note Title & Description Header */}
      <div className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
        <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="size-4.5 text-primary shrink-0" />
          <span className="truncate">{note.title}</span>
        </h2>
        {note.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {note.description}
          </p>
        )}
      </div>

      {/* Embedded Google Drive Iframe Viewer */}
      <div className="relative flex-1 bg-muted/10">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-xs">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading Google Drive document preview...
            </p>
          </div>
        )}

        <iframe
          src={driveInfo.embedUrl}
          title={note.title}
          width="100%"
          height="100%"
          allow="autoplay"
          loading="lazy"
          onLoad={() => setIframeLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>

      {/* Bottom Hint Banner */}
      <div className="border-t border-border/60 bg-card px-4 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="size-3.5 text-primary shrink-0" />
          <span className="truncate">
            Using Google Drive embedded preview. Zero cloud storage egress.
          </span>
        </div>
        <a
          href={driveInfo.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline shrink-0 ml-2"
        >
          Can&apos;t load preview? Click to open
        </a>
      </div>
    </div>
  );
}
