export type ResourceCategoryId =
  | "programming-data"
  | "ai-ml"
  | "genai"
  | "agents"
  | "system-design"
  | "interview"
  | "01-programming"
  | "02-ai-ml"
  | "03-genai"
  | "04-agents"
  | "05-system-design"
  | "06-interview";

export interface ResourceCategory {
  id: ResourceCategoryId;
  numberPrefix?: string;
  label: string;
  folderName?: string;
  description: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  iconName?: "Code2" | "Cpu" | "Sparkles" | "Zap" | "Server" | "GraduationCap";
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export interface ResourceNote {
  id: string;
  title: string;
  categoryId: ResourceCategoryId;
  driveFileId: string;
  driveUrl: string;
  description: string;
  tags: string[];
  isHandwritten?: boolean;
  pageCount?: string;
  relevance?: "cohort_and_interviews" | "interviews_only" | "core_fundamentals";
  customAdded?: boolean;
}
