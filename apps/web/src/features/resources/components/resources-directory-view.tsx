"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ArrowUpRight,
  X,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderPlus,
  Link as LinkIcon,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/form-field";
import { cn } from "@/lib/utils";
import {
  resourcesService,
  type ResourceFolder,
  type ResourceFile,
} from "@/services/resources.service";
import { toast } from "sonner";

const AVAILABLE_ICONS = [
  { label: "Folder", value: "FolderOpen", icon: FolderOpen },
  { label: "Code", value: "Code2", icon: Code2 },
  { label: "AI / Chip", value: "Cpu", icon: Cpu },
  { label: "Sparkles", value: "Sparkles", icon: Sparkles },
  { label: "Speed / Zap", value: "Zap", icon: Zap },
  { label: "System / Server", value: "Server", icon: Server },
  { label: "Interview / Cap", value: "GraduationCap", icon: GraduationCap },
];

function getCategoryIcon(iconName?: string | null) {
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
      return GraduationCap;
    case "FolderOpen":
    default:
      return FolderOpen;
  }
}

interface ResourcesDirectoryViewProps {
  canManage?: boolean;
}

export function ResourcesDirectoryView({ canManage = false }: ResourcesDirectoryViewProps) {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state for admin operations
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ResourceFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderDriveUrl, setFolderDriveUrl] = useState("");
  const [folderIconName, setFolderIconName] = useState("FolderOpen");

  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>("");
  const [editingFile, setEditingFile] = useState<ResourceFile | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDriveUrl, setFileDriveUrl] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileTagsInput, setFileTagsInput] = useState("");
  const [fileIsHandwritten, setFileIsHandwritten] = useState(false);

  // Delete confirmations
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<ResourceFolder | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<ResourceFile | null>(null);

  // Query live resources from DB
  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourcesService.getResources(),
  });

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; driveFolderUrl?: string; iconName?: string }) =>
      resourcesService.createFolder(payload),
    onSuccess: () => {
      toast.success("Folder created successfully!");
      setFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create folder");
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      resourcesService.updateFolder(id, payload),
    onSuccess: () => {
      toast.success("Folder updated successfully!");
      setFolderDialogOpen(false);
      setEditingFolder(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update folder");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => resourcesService.deleteFolder(id),
    onSuccess: () => {
      toast.success("Folder and its files deleted successfully");
      setDeleteFolderTarget(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete folder");
    },
  });

  const createFileMutation = useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: any }) =>
      resourcesService.createFile(folderId, payload),
    onSuccess: () => {
      toast.success("File added to folder!");
      setFileDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add file");
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      resourcesService.updateFile(id, payload),
    onSuccess: () => {
      toast.success("File updated successfully!");
      setFileDialogOpen(false);
      setEditingFile(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => resourcesService.deleteFile(id),
    onSuccess: () => {
      toast.success("File deleted successfully");
      setDeleteFileTarget(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete file");
    },
  });

  // Handlers
  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setFolderName("");
    setFolderDescription("");
    setFolderDriveUrl("");
    setFolderIconName("FolderOpen");
    setFolderDialogOpen(true);
  };

  const handleOpenEditFolder = (folder: ResourceFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderDescription(folder.description || "");
    setFolderDriveUrl(folder.driveFolderUrl || "");
    setFolderIconName(folder.iconName || "FolderOpen");
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    if (editingFolder) {
      updateFolderMutation.mutate({
        id: editingFolder.id,
        payload: {
          name: folderName.trim(),
          description: folderDescription.trim() || undefined,
          driveFolderUrl: folderDriveUrl.trim() || undefined,
          iconName: folderIconName,
        },
      });
    } else {
      createFolderMutation.mutate({
        name: folderName.trim(),
        description: folderDescription.trim() || undefined,
        driveFolderUrl: folderDriveUrl.trim() || undefined,
        iconName: folderIconName,
      });
    }
  };

  const handleOpenAddFile = (folderId: string) => {
    setTargetFolderId(folderId);
    setEditingFile(null);
    setFileTitle("");
    setFileDriveUrl("");
    setFileDescription("");
    setFileTagsInput("");
    setFileIsHandwritten(false);
    setFileDialogOpen(true);
  };

  const handleOpenEditFile = (folderId: string, file: ResourceFile) => {
    setTargetFolderId(folderId);
    setEditingFile(file);
    setFileTitle(file.title);
    setFileDriveUrl(file.driveUrl);
    setFileDescription(file.description || "");
    setFileTagsInput(file.tags.join(", "));
    setFileIsHandwritten(file.isHandwritten);
    setFileDialogOpen(true);
  };

  const handleSaveFile = () => {
    if (!fileTitle.trim() || !fileDriveUrl.trim()) {
      toast.error("File title and Google Drive link are required");
      return;
    }

    const tags = fileTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingFile) {
      updateFileMutation.mutate({
        id: editingFile.id,
        payload: {
          title: fileTitle.trim(),
          driveUrl: fileDriveUrl.trim(),
          description: fileDescription.trim() || undefined,
          tags,
          isHandwritten: fileIsHandwritten,
          folderId: targetFolderId,
        },
      });
    } else {
      createFileMutation.mutate({
        folderId: targetFolderId,
        payload: {
          title: fileTitle.trim(),
          driveUrl: fileDriveUrl.trim(),
          description: fileDescription.trim() || undefined,
          tags,
          isHandwritten: fileIsHandwritten,
        },
      });
    }
  };

  // Filtered views
  const allFiles = useMemo(() => {
    return folders.flatMap((f) => f.files);
  }, [folders]);

  const visibleFolders = useMemo(() => {
    const active =
      selectedFolderId === "all"
        ? folders
        : folders.filter((f) => f.id === selectedFolderId || f.slug === selectedFolderId);

    if (!searchQuery.trim()) {
      return active;
    }

    const q = searchQuery.toLowerCase();
    return active
      .map((folder) => {
        const matchingFiles = folder.files.filter(
          (file) =>
            file.title.toLowerCase().includes(q) ||
            (file.description && file.description.toLowerCase().includes(q)) ||
            file.tags.some((t) => t.toLowerCase().includes(q)),
        );
        return {
          ...folder,
          files: matchingFiles,
        };
      })
      .filter((folder) => folder.files.length > 0);
  }, [folders, selectedFolderId, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* 1. Page Heading with Search Bar and optional Admin "+ New Folder" button */}
      <PageHeading
        title={canManage ? "Knowledge & Resources Management" : "Technical Notes & Resources"}
        description={
          canManage
            ? "Create resource folders, paste Google Drive links, and organize handwritten notes and CS study materials."
            : "Comprehensive handwritten notes, core CS blueprints, and interview guides organized by topic folder."
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72 md:w-80 shrink-0">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search notes by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs rounded-xl bg-card border-border/70 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {canManage && (
              <Button
                onClick={handleOpenCreateFolder}
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs shrink-0"
              >
                <FolderPlus className="size-4" />
                <span>New Folder</span>
              </Button>
            )}
          </div>
        }
      />

      {/* 2. Folder Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <button
          type="button"
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
            {allFiles.length}
          </span>
        </button>

        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id || selectedFolderId === folder.slug;
          const Icon = getCategoryIcon(folder.iconName);

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              <span>{folder.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground",
                )}
              >
                {folder.files.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Folder & File Directory Architecture */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : visibleFolders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3 bg-muted/10 my-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm text-foreground">
              {searchQuery ? `No files found matching "${searchQuery}"` : "No resource folders found"}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'Try searching for a different keyword or choose "All Folders" to view all available resources.'
                : canManage
                  ? 'Click "New Folder" above to create your first resource folder and attach Google Drive files.'
                  : "Your mentor and administrator will publish study notes and resources here."}
            </p>
          </div>
          {searchQuery && (
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
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8 mt-2">
          {visibleFolders.map((folder) => {
            const Icon = getCategoryIcon(folder.iconName);
            const colorClass = folder.colorScheme?.bg || "bg-primary/10 text-primary";
            const borderClass = folder.colorScheme?.border || "border-primary/20";

            return (
              <section key={folder.id} className="flex flex-col gap-4">
                {/* Folder Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border shrink-0",
                        colorClass,
                        borderClass,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-lg font-bold text-foreground">
                          {folder.name}
                        </h2>
                        {folder.driveFolderUrl && (
                          <a
                            href={folder.driveFolderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2 ml-1"
                            title="Open Google Drive folder"
                          >
                            <span>Drive Folder</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      {folder.description && (
                        <p className="text-xs text-muted-foreground">{folder.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="text-xs text-muted-foreground font-medium mr-1">
                      {folder.files.length} {folder.files.length === 1 ? "file" : "files"}
                    </span>

                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAddFile(folder.id)}
                          className="h-8 px-2.5 text-xs font-semibold gap-1"
                        >
                          <Plus className="size-3.5" />
                          <span>Add File</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEditFolder(folder)}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title="Edit Folder"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteFolderTarget(folder)}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          title="Delete Folder"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Files Grid */}
                {folder.files.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-2 bg-muted/5">
                    <p className="text-xs font-medium text-muted-foreground">
                      No files in this folder yet.
                    </p>
                    {canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAddFile(folder.id)}
                        className="text-xs h-8 gap-1"
                      >
                        <Plus className="size-3.5" />
                        <span>Add First File</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folder.files.map((file) => (
                      <div
                        key={file.id}
                        className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-2">
                          {/* File Top Bar */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                              <FileText className="size-4" />
                            </div>

                            <div className="flex items-center gap-1.5">
                              {canManage && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 mr-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleOpenEditFile(folder.id, file);
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Edit file"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setDeleteFileTarget(file);
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive cursor-pointer"
                                    title="Delete file"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              )}

                              <a
                                href={file.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                              >
                                <span>Open Drive</span>
                                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </a>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                              {file.title}
                            </h3>
                            {file.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* File Tags Footer */}
                        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {file.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          {file.isHandwritten && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              Handwritten
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Admin Dialog: Create / Edit Folder */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderPlus className="size-4.5 text-primary" />
              <span>{editingFolder ? "Edit Resource Folder" : "Create New Resource Folder"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <FormField label="Folder Name *" htmlFor="folderName">
              <Input
                id="folderName"
                placeholder="e.g. Cloud Computing & DevOps"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </FormField>

            <FormField label="Folder Description" htmlFor="folderDesc">
              <Textarea
                id="folderDesc"
                placeholder="Brief summary of topics covered in this folder..."
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </FormField>

            <FormField label="Google Drive Folder Link (optional)" htmlFor="folderDrive">
              <Input
                id="folderDrive"
                placeholder="https://drive.google.com/drive/folders/..."
                value={folderDriveUrl}
                onChange={(e) => setFolderDriveUrl(e.target.value)}
              />
            </FormField>

            <FormField label="Folder Icon" htmlFor="folderIcon">
              <select
                id="folderIcon"
                value={folderIconName}
                onChange={(e) => setFolderIconName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {AVAILABLE_ICONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveFolder}
              disabled={createFolderMutation.isPending || updateFolderMutation.isPending}
            >
              {createFolderMutation.isPending || updateFolderMutation.isPending
                ? "Saving..."
                : editingFolder
                  ? "Update Folder"
                  : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog: Create / Edit File */}
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <LinkIcon className="size-4.5 text-primary" />
              <span>{editingFile ? "Edit File Resource" : "Add File to Folder"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <FormField label="File Title *" htmlFor="fileTitle">
              <Input
                id="fileTitle"
                placeholder="e.g. Distributed Caching & Redis Patterns"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Google Drive File Link *" htmlFor="fileDriveUrl">
              <Input
                id="fileDriveUrl"
                placeholder="https://drive.google.com/file/d/.../view"
                value={fileDriveUrl}
                onChange={(e) => setFileDriveUrl(e.target.value)}
              />
            </FormField>

            <FormField label="Description" htmlFor="fileDesc">
              <Textarea
                id="fileDesc"
                placeholder="Summary of notes or blueprint..."
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </FormField>

            <FormField label="Tags (comma-separated)" htmlFor="fileTags">
              <Input
                id="fileTags"
                placeholder="e.g. Redis, Caching, System Design"
                value={fileTagsInput}
                onChange={(e) => setFileTagsInput(e.target.value)}
              />
            </FormField>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isHandwritten"
                checked={fileIsHandwritten}
                onChange={(e) => setFileIsHandwritten(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isHandwritten" className="text-xs font-medium text-foreground cursor-pointer">
                Mark as Handwritten Notes
              </label>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFileDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveFile}
              disabled={createFileMutation.isPending || updateFileMutation.isPending}
            >
              {createFileMutation.isPending || updateFileMutation.isPending
                ? "Saving..."
                : editingFile
                  ? "Update File"
                  : "Add File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteFolderTarget)}
        onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
      >
        <DialogContent className="max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-destructive">
              Delete Folder?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete folder &quot;{deleteFolderTarget?.name}&quot;? This will permanently remove the folder and all its associated file links.
          </p>
          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteFolderTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteFolderMutation.isPending}
              onClick={() => deleteFolderTarget && deleteFolderMutation.mutate(deleteFolderTarget.id)}
            >
              {deleteFolderMutation.isPending ? "Deleting..." : "Delete Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteFileTarget)}
        onOpenChange={(open) => !open && setDeleteFileTarget(null)}
      >
        <DialogContent className="max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-destructive">
              Delete File Link?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to remove &quot;{deleteFileTarget?.title}&quot; from this folder?
          </p>
          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteFileTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteFileMutation.isPending}
              onClick={() => deleteFileTarget && deleteFileMutation.mutate(deleteFileTarget.id)}
            >
              {deleteFileMutation.isPending ? "Deleting..." : "Delete File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
