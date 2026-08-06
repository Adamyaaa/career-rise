"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FileUpload({
  onFileSelect,
  accept,
}: {
  onFileSelect: (file: File | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const next = files?.[0] ?? null;
    setFile(next);
    onFileSelect(next);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <FileCheck className="size-4 text-emerald-500" />
          {file.name}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setFile(null);
            onFileSelect(null);
          }}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border/70 hover:bg-muted/30",
      )}
    >
      <UploadCloud className="size-5 text-muted-foreground" />
      <p className="text-sm text-foreground">
        <span className="font-medium">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-muted-foreground">Uploads go straight to storage — never through this API</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
