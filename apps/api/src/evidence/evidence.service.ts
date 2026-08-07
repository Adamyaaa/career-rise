import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEvidenceDto } from "./dto/create-evidence.dto";

// Link-based evidence only for now ("share your Drive link as proof") — file-based
// evidence (storageKey) is a later phase, same as shared-files' upload path.
@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(studentId: string, dto: CreateEvidenceDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { module: true },
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    const cohortId = lesson.module.cohortId;
    const enrolled = await this.prisma.cohortEnrollment.findFirst({
      where: { studentId, cohortId, status: "active" },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException("You are not enrolled in this cohort");
    }

    return this.prisma.evidence.create({
      data: {
        studentId,
        lessonId: dto.lessonId,
        cohortId,
        evidenceType: "drive_link",
        externalUrl: dto.externalUrl,
        metadata: {},
      },
    });
  }

  listMine(studentId: string, cohortId: string) {
    return this.prisma.evidence.findMany({
      where: { studentId, cohortId },
      orderBy: { submittedAt: "desc" },
    });
  }
}
