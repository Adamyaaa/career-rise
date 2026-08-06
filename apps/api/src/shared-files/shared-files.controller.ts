import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import { Response } from "express";
import { SharedFilesService } from "./shared-files.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import * as fs from "fs";

// Ensure uploads folder exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads", { recursive: true });
}

@Controller("shared-files")
export class SharedFilesController {
  constructor(private readonly sharedFilesService: SharedFilesService) {}

  @Post()
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = randomUUID();
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: any,
  ) {
    return this.sharedFilesService.create(file, dto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query("cohortId") cohortId?: string,
    @Query("lessonId") lessonId?: string,
  ) {
    return this.sharedFilesService.findAll(req.user.id, req.user.role, cohortId, lessonId);
  }

  @Get(":id/download")
  async downloadFile(@Param("id") id: string, @Req() req: any, @Res() res: Response) {
    const file = await this.sharedFilesService.findOneForDownload(id, req.user.id, req.user.role);
    res.download(file.fileKey, file.fileName);
  }

  @Delete(":id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  remove(@Param("id") id: string, @Req() req: any) {
    return this.sharedFilesService.remove(id, req.user.id, req.user.role);
  }
}
