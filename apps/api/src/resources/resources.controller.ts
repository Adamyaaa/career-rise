import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("resources")
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // Available to all authenticated users (students, mentors, admins)
  @Get()
  async getAllResources() {
    return this.resourcesService.getAllFoldersWithFiles();
  }

  // Admin Folder Management
  @Roles("SUPER_ADMIN")
  @Post("folders")
  async createFolder(@Body() body: CreateFolderDto) {
    return this.resourcesService.createFolder(body);
  }

  @Roles("SUPER_ADMIN")
  @Patch("folders/:id")
  async updateFolder(@Param("id") id: string, @Body() body: UpdateFolderDto) {
    return this.resourcesService.updateFolder(id, body);
  }

  @Roles("SUPER_ADMIN")
  @Delete("folders/:id")
  async deleteFolder(@Param("id") id: string) {
    return this.resourcesService.deleteFolder(id);
  }

  // Admin File Management
  @Roles("SUPER_ADMIN")
  @Post("folders/:folderId/files")
  async createFile(
    @Param("folderId") folderId: string,
    @Body() body: CreateFileDto,
  ) {
    return this.resourcesService.createFile(folderId, body);
  }

  @Roles("SUPER_ADMIN")
  @Patch("files/:id")
  async updateFile(@Param("id") id: string, @Body() body: UpdateFileDto) {
    return this.resourcesService.updateFile(id, body);
  }

  @Roles("SUPER_ADMIN")
  @Delete("files/:id")
  async deleteFile(@Param("id") id: string) {
    return this.resourcesService.deleteFile(id);
  }
}
