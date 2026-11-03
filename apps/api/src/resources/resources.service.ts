import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { INITIAL_CATEGORIES, TECHNICAL_NOTES } from "./constants/default-resources";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async getAllFoldersWithFiles() {
    let folders = await this.prisma.resourceFolder.findMany({
      include: {
        files: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Auto-seed initial content if the repository is empty
    if (folders.length === 0) {
      await this.seedInitialResources();
      folders = await this.prisma.resourceFolder.findMany({
        include: {
          files: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });
    }

    return folders;
  }

  private async seedInitialResources() {
    for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
      const cat = INITIAL_CATEGORIES[i];
      const folder = await this.prisma.resourceFolder.create({
        data: {
          slug: cat.slug,
          name: cat.label,
          description: cat.description,
          driveFolderUrl: cat.driveFolderUrl || null,
          iconName: cat.iconName || "FolderOpen",
          colorScheme: cat.colorScheme || null,
          order: i,
        },
      });

      const catNotes = TECHNICAL_NOTES.filter(
        (n: any) => n.categoryId === cat.id || n.categoryId === cat.slug,
      );

      for (let j = 0; j < catNotes.length; j++) {
        const note = catNotes[j];
        await this.prisma.resourceFile.create({
          data: {
            folderId: folder.id,
            title: note.title,
            description: note.description || null,
            driveUrl: note.driveUrl,
            tags: Array.isArray(note.tags) ? note.tags : [],
            isHandwritten: Boolean(note.isHandwritten),
            order: j,
          },
        });
      }
    }
  }

  async createFolder(dto: CreateFolderDto) {
    if (!dto.name?.trim()) {
      throw new BadRequestException("Folder name is required");
    }

    let baseSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.name);
    if (!baseSlug) baseSlug = `folder-${Date.now()}`;

    // Ensure slug uniqueness
    let slug = baseSlug;
    const existingSlug = await this.prisma.resourceFolder.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    let order = dto.order;
    if (order === undefined) {
      const maxOrder = await this.prisma.resourceFolder.aggregate({
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    return this.prisma.resourceFolder.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        driveFolderUrl: dto.driveFolderUrl?.trim() || null,
        iconName: dto.iconName?.trim() || "FolderOpen",
        colorScheme: dto.colorScheme || null,
        order,
      },
      include: {
        files: true,
      },
    });
  }

  async updateFolder(id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.resourceFolder.findUnique({
      where: { id },
    });
    if (!folder) {
      throw new NotFoundException("Resource folder not found");
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.driveFolderUrl !== undefined) data.driveFolderUrl = dto.driveFolderUrl?.trim() || null;
    if (dto.iconName !== undefined) data.iconName = dto.iconName?.trim() || "FolderOpen";
    if (dto.colorScheme !== undefined) data.colorScheme = dto.colorScheme;
    if (dto.order !== undefined) data.order = dto.order;

    if (dto.slug !== undefined && dto.slug.trim() && dto.slug !== folder.slug) {
      const newSlug = slugify(dto.slug);
      const conflict = await this.prisma.resourceFolder.findUnique({
        where: { slug: newSlug },
      });
      if (conflict && conflict.id !== id) {
        throw new BadRequestException("A folder with this slug already exists");
      }
      data.slug = newSlug;
    }

    return this.prisma.resourceFolder.update({
      where: { id },
      data,
      include: {
        files: { orderBy: { order: "asc" } },
      },
    });
  }

  async deleteFolder(id: string) {
    const folder = await this.prisma.resourceFolder.findUnique({
      where: { id },
    });
    if (!folder) {
      throw new NotFoundException("Resource folder not found");
    }

    return this.prisma.resourceFolder.delete({
      where: { id },
    });
  }

  async createFile(folderId: string, dto: CreateFileDto) {
    const folder = await this.prisma.resourceFolder.findUnique({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException("Target folder not found");
    }

    if (!dto.title?.trim() || !dto.driveUrl?.trim()) {
      throw new BadRequestException("File title and Google Drive link are required");
    }

    let order = dto.order;
    if (order === undefined) {
      const maxOrder = await this.prisma.resourceFile.aggregate({
        where: { folderId },
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    return this.prisma.resourceFile.create({
      data: {
        folderId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        driveUrl: dto.driveUrl.trim(),
        tags: Array.isArray(dto.tags) ? dto.tags.map((t) => t.trim()).filter(Boolean) : [],
        isHandwritten: Boolean(dto.isHandwritten),
        order,
      },
    });
  }

  async updateFile(id: string, dto: UpdateFileDto) {
    const file = await this.prisma.resourceFile.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException("Resource file not found");
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.driveUrl !== undefined) data.driveUrl = dto.driveUrl.trim();
    if (dto.tags !== undefined) {
      data.tags = Array.isArray(dto.tags) ? dto.tags.map((t) => t.trim()).filter(Boolean) : [];
    }
    if (dto.isHandwritten !== undefined) data.isHandwritten = dto.isHandwritten;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.folderId !== undefined) {
      const targetFolder = await this.prisma.resourceFolder.findUnique({
        where: { id: dto.folderId },
      });
      if (!targetFolder) {
        throw new NotFoundException("Target folder does not exist");
      }
      data.folderId = dto.folderId;
    }

    return this.prisma.resourceFile.update({
      where: { id },
      data,
    });
  }

  async deleteFile(id: string) {
    const file = await this.prisma.resourceFile.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException("Resource file not found");
    }

    return this.prisma.resourceFile.delete({
      where: { id },
    });
  }
}
