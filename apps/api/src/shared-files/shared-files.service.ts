import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import * as fs from "fs";

@Injectable()
export class SharedFilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: Express.Multer.File, dto: UploadFileDto, uploaderId: string) {
    let cohortId = dto.cohortId || null;

    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
        include: { module: true },
      });
      if (!lesson) {
        throw new NotFoundException("Lesson not found");
      }
      // denormalized from the lesson's module->cohort chain, same convention as Evidence/Attendance
      cohortId = lesson.module.cohortId;
    }

    return this.prisma.sharedFile.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        fileName: file.originalname,
        fileKey: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedById: uploaderId,
        cohortId,
        lessonId: dto.lessonId || null,
      },
    });
  }

  async findAll(userId: string, role: string, cohortIdFilter?: string, lessonIdFilter?: string) {
    if (role === "STUDENT") {
      // Find active cohorts the student is enrolled in
      const enrollments = await this.prisma.cohortEnrollment.findMany({
        where: { studentId: userId, status: "active" },
      });
      const cohortIds = enrollments.map((e) => e.cohortId);

      // Students can only see global files or files scoped to their active cohorts
      return this.prisma.sharedFile.findMany({
        where: {
          AND: [
            {
              OR: [
                { cohortId: null },
                { cohortId: { in: cohortIds } },
              ],
            },
            lessonIdFilter ? { lessonId: lessonIdFilter } : {},
          ],
        },
        include: {
          uploadedBy: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Mentors and admins see all files or filtered by cohort/lesson
    return this.prisma.sharedFile.findMany({
      where: {
        ...(cohortIdFilter ? { cohortId: cohortIdFilter } : {}),
        ...(lessonIdFilter ? { lessonId: lessonIdFilter } : {}),
      },
      include: {
        uploadedBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneForDownload(id: string, userId: string, role: string) {
    const file = await this.prisma.sharedFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    if (role === "STUDENT" && file.cohortId !== null) {
      const isEnrolled = await this.prisma.cohortEnrollment.findFirst({
        where: { studentId: userId, cohortId: file.cohortId, status: "active" },
      });
      if (!isEnrolled) {
        throw new ForbiddenException("You do not have permission to download this file");
      }
    }

    return file;
  }

  async remove(id: string, userId: string, role: string) {
    const file = await this.prisma.sharedFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException("File not found");
    }

    if (role !== "SUPER_ADMIN" && file.uploadedById !== userId) {
      throw new ForbiddenException("You do not have permission to delete this file");
    }

    // Delete file from local disk
    try {
      if (fs.existsSync(file.fileKey)) {
        fs.unlinkSync(file.fileKey);
      }
    } catch (err) {
      // Log error but continue deleting from DB
      console.error(`Failed to delete file from disk: ${file.fileKey}`, err);
    }

    return this.prisma.sharedFile.delete({
      where: { id },
    });
  }
}
