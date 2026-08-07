import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

// Read-only for now — course/cohort/module/lesson creation is a later phase.
// listCohorts/listModulesWithLessons also serve the mentor material-upload picker
// (any authenticated role, no progress fields); listMyCohorts and the STUDENT branch
// of listModulesWithLessons are for the student "My Learning" dashboard.
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

  async listMyCohorts(studentId: string) {
    const enrollments = await this.prisma.cohortEnrollment.findMany({
      where: { studentId, status: "active" },
      select: {
        cohort: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            course: { select: { id: true, title: true } },
            modules: { select: { lessons: { select: { id: true } } } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const cohortIds = enrollments.map((e) => e.cohort.id);
    const completedByCohort = await this.completedLessonIdsByCohort(studentId, cohortIds);

    return enrollments.map(({ cohort }) => {
      const lessonIds = cohort.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const completed = completedByCohort.get(cohort.id) ?? new Set<string>();
      const completedLessons = lessonIds.filter((id) => completed.has(id)).length;

      return {
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        course: cohort.course,
        progress: progressOf(completedLessons, lessonIds.length),
      };
    });
  }

  async listModulesWithLessons(cohortId: string, user: AuthenticatedUser) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    const modules = await this.prisma.module.findMany({
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

    if (user.role !== Role.STUDENT) {
      return modules;
    }

    const enrolled = await this.prisma.cohortEnrollment.findFirst({
      where: { studentId: user.id, cohortId, status: "active" },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException("You are not enrolled in this cohort");
    }

    const completed = (await this.completedLessonIdsByCohort(user.id, [cohortId])).get(cohortId) ?? new Set<string>();

    let previousComplete = true;
    return modules.map((module) => {
      const lessons = module.lessons.map((lesson) => ({ ...lesson, completed: completed.has(lesson.id) }));
      const completedLessons = lessons.filter((l) => l.completed).length;
      const progress = progressOf(completedLessons, lessons.length);
      const locked = !previousComplete;
      previousComplete = progress.percent === 100;

      return { ...module, lessons, ...progress, locked };
    });
  }

  // Lessons a student has submitted Evidence for, grouped by cohort — one query for any
  // number of cohorts (listMyCohorts scans several at once; the modules endpoint just one).
  private async completedLessonIdsByCohort(studentId: string, cohortIds: string[]) {
    const evidence = await this.prisma.evidence.findMany({
      where: { studentId, cohortId: { in: cohortIds } },
      select: { cohortId: true, lessonId: true },
    });

    const byCohort = new Map<string, Set<string>>();
    for (const { cohortId, lessonId } of evidence) {
      if (!byCohort.has(cohortId)) byCohort.set(cohortId, new Set());
      byCohort.get(cohortId)!.add(lessonId);
    }
    return byCohort;
  }
}

function progressOf(completedLessons: number, totalLessons: number) {
  return {
    completedLessons,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
  };
}
