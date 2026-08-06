import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// Read-only for now — course/cohort/module/lesson creation is a later phase.
// This exists only so mentors can browse real lessons to attach material to.
@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  listCohorts() {
    return this.prisma.cohort.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        course: { select: { id: true, title: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async listModulesWithLessons(cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    return this.prisma.module.findMany({
      where: { cohortId },
      select: {
        id: true,
        title: true,
        order: true,
        lessons: {
          select: { id: true, title: true, order: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }
}
