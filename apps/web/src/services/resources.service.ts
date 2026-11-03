import { apiClient } from "@/lib/api-client";

export interface ResourceFile {
  id: string;
  folderId: string;
  title: string;
  description: string | null;
  driveUrl: string;
  tags: string[];
  isHandwritten: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceFolder {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  driveFolderUrl: string | null;
  iconName: string | null;
  colorScheme: any;
  order: number;
  createdAt: string;
  updatedAt: string;
  files: ResourceFile[];
}

export interface CreateFolderPayload {
  name: string;
  slug?: string;
  description?: string;
  driveFolderUrl?: string;
  iconName?: string;
  colorScheme?: any;
  order?: number;
}

export interface UpdateFolderPayload {
  name?: string;
  slug?: string;
  description?: string;
  driveFolderUrl?: string;
  iconName?: string;
  colorScheme?: any;
  order?: number;
}

export interface CreateFilePayload {
  title: string;
  driveUrl: string;
  description?: string;
  tags?: string[];
  isHandwritten?: boolean;
  order?: number;
}

export interface UpdateFilePayload {
  title?: string;
  driveUrl?: string;
  description?: string;
  tags?: string[];
  isHandwritten?: boolean;
  order?: number;
  folderId?: string;
}

export const resourcesService = {
  getResources: async () => {
    return apiClient.get<ResourceFolder[]>("/resources");
  },

  createFolder: async (payload: CreateFolderPayload) => {
    return apiClient.post<ResourceFolder>("/resources/folders", payload);
  },

  updateFolder: async (id: string, payload: UpdateFolderPayload) => {
    return apiClient.patch<ResourceFolder>(`/resources/folders/${id}`, payload);
  },

  deleteFolder: async (id: string) => {
    return apiClient.delete(`/resources/folders/${id}`);
  },

  createFile: async (folderId: string, payload: CreateFilePayload) => {
    return apiClient.post<ResourceFile>(`/resources/folders/${folderId}/files`, payload);
  },

  updateFile: async (id: string, payload: UpdateFilePayload) => {
    return apiClient.patch<ResourceFile>(`/resources/files/${id}`, payload);
  },

  deleteFile: async (id: string) => {
    return apiClient.delete(`/resources/files/${id}`);
  },
};
