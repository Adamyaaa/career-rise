import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

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

  async listMyCohorts(user: AuthenticatedUser) {
    if (user.role === Role.MENTOR) {
      const assignments = await this.prisma.cohortMentorAssignment.findMany({
        where: { mentorProfile: { userId: user.id } },
        select: {
          cohort: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { cohort: { startDate: "desc" } },
      });
      // A mentor has no personal lesson completion, so no `progress` field here —
      // the frontend CohortCard renders without a progress bar when it's absent.
      return assignments.map((a) => a.cohort);
    }

    const enrollments = await this.prisma.cohortEnrollment.findMany({
      where: { studentId: user.id, status: "active" },
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
    const completedByCohort = await this.completedLessonIdsByCohort(user.id, cohortIds);

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

  // Counts for the cohort header. `cohortAvgPercent` is the mean completion across
  // active students, which equals total completions / (students * lessons) — no need
  // to group per student. Withdrawn students are excluded from both sides of that.
  async getCohortOverview(cohortId: string, user: AuthenticatedUser) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        course: { select: { id: true, title: true, description: true } },
        _count: { select: { modules: true } },
      },
    });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    if (user.role === Role.STUDENT) {
      const enrolled = await this.prisma.cohortEnrollment.findFirst({
        where: { studentId: user.id, cohortId, status: "active" },
        select: { id: true },
      });
      if (!enrolled) {
        throw new ForbiddenException("You are not enrolled in this cohort");
      }
    }

    const activeStudentFilter = { enrollments: { some: { cohortId, status: "active" } } };

    const [studentCount, lessonCount, taughtCount, totalCompletions, myCompletions] = await Promise.all([
      this.prisma.cohortEnrollment.count({ where: { cohortId, status: "active" } }),
      this.prisma.lesson.count({ where: { module: { cohortId } } }),
      this.prisma.lesson.count({ where: { module: { cohortId }, taughtAt: { not: null } } }),
      this.prisma.lessonCompletion.count({ where: { cohortId, student: activeStudentFilter } }),
      user.role === Role.STUDENT
        ? this.prisma.lessonCompletion.count({ where: { cohortId, studentId: user.id } })
        : Promise.resolve(0),
    ]);

    const denominator = studentCount * lessonCount;
    const { _count, ...cohortFields } = cohort;

    return {
      ...cohortFields,
      moduleCount: _count.modules,
      studentCount,
      lessonCount,
      taughtCount,
      cohortAvgPercent: denominator === 0 ? 0 : Math.round((totalCompletions / denominator) * 100),
      myProgressPercent:
        user.role === Role.STUDENT && lessonCount > 0 ? Math.round((myCompletions / lessonCount) * 100) : null,
    };
  }

  async listModulesWithLessons(cohortId: string, user: AuthenticatedUser) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    const rows = await this.prisma.module.findMany({
      where: { cohortId },
      select: {
        id: true,
        title: true,
        order: true,
        lessons: {
          select: { id: true, title: true, order: true, slidesUrl: true, taughtAt: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // `taughtAt` is a timestamp in the DB but only ever read as a flag by both UIs.
    const modules = rows.map((module) => ({
      ...module,
      lessons: module.lessons.map(({ taughtAt, ...lesson }) => ({ ...lesson, taught: taughtAt !== null })),
    }));

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

    return modules.map((module) => {
      const lessons = module.lessons.map((lesson) => ({ ...lesson, completed: completed.has(lesson.id) }));
      const completedLessons = lessons.filter((l) => l.completed).length;

      return { ...module, lessons, ...progressOf(completedLessons, lessons.length) };
    });
  }

  async setLessonComplete(user: AuthenticatedUser, lessonId: string, completed: boolean) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    const cohortId = lesson.module.cohortId;

    const enrolled = await this.prisma.cohortEnrollment.findFirst({
      where: { studentId: user.id, cohortId, status: "active" },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException("You are not enrolled in this cohort");
    }

    if (completed) {
      await this.prisma.lessonCompletion.upsert({
        where: { studentId_lessonId: { studentId: user.id, lessonId } },
        update: {},
        create: { studentId: user.id, lessonId, cohortId },
      });
    } else {
      await this.prisma.lessonCompletion.deleteMany({
        where: { studentId: user.id, lessonId },
      });
    }

    return { lessonId, completed };
  }

  async updateLessonSlidesUrl(user: AuthenticatedUser, lessonId: string, slidesUrl?: string) {
    await this.assertCanManageLesson(user, lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { slidesUrl: slidesUrl?.trim() || null },
      select: { id: true, slidesUrl: true },
    });
  }

  // A mentor marking a class delivered to the whole cohort — not the same as a student's
  // own LessonCompletion, which stays untouched here.
  async setLessonTaught(user: AuthenticatedUser, lessonId: string, taught: boolean) {
    await this.assertCanManageLesson(user, lessonId);

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { taughtAt: taught ? new Date() : null },
    });

    return { lessonId, taught };
  }

  // The cohort roster with each student's own completion — progress is per student
  // (LessonCompletion is unique on studentId+lessonId), so these numbers differ per row.
  async listCohortStudents(user: AuthenticatedUser, cohortId: string) {
    await this.assertCanManageCohort(user, cohortId);

    const [lessonCount, enrollments, completionCounts] = await Promise.all([
      this.prisma.lesson.count({ where: { module: { cohortId } } }),
      this.prisma.cohortEnrollment.findMany({
        where: { cohortId },
        select: {
          status: true,
          enrolledAt: true,
          student: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { enrolledAt: "asc" },
      }),
      this.prisma.lessonCompletion.groupBy({
        by: ["studentId"],
        where: { cohortId },
        _count: { _all: true },
      }),
    ]);

    const completedByStudent = new Map(completionCounts.map((row) => [row.studentId, row._count._all]));

    return enrollments.map((enrollment) => {
      const completedLessons = completedByStudent.get(enrollment.student.id) ?? 0;
      return {
        studentId: enrollment.student.id,
        email: enrollment.student.email,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedLessons,
        totalLessons: lessonCount,
        percent: lessonCount === 0 ? 0 : Math.round((completedLessons / lessonCount) * 100),
      };
    });
  }

  // Enrolls an existing account. Deliberately does not create users — a person signs up
  // themselves, then a mentor adds them to the cohort by email.
  async enrollStudent(user: AuthenticatedUser, cohortId: string, email: string) {
    await this.assertCanManageCohort(user, cohortId);

    const student = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, role: true },
    });
    if (!student) {
      throw new NotFoundException("No account found with that email — they need to sign up first");
    }
    if (student.role !== Role.STUDENT) {
      throw new BadRequestException("Only student accounts can be enrolled in a cohort");
    }

    const existing = await this.prisma.cohortEnrollment.findFirst({
      where: { cohortId, studentId: student.id },
      select: { id: true, status: true },
    });

    if (existing) {
      if (existing.status === "active") {
        throw new ConflictException("That student is already in this cohort");
      }
      // Re-adding someone who was withdrawn reactivates the original row, keeping their history.
      await this.prisma.cohortEnrollment.update({
        where: { id: existing.id },
        data: { status: "active" },
      });
    } else {
      await this.prisma.cohortEnrollment.create({
        data: { cohortId, studentId: student.id, status: "active" },
      });
    }

    return { studentId: student.id, email: student.email, status: "active" };
  }

  // Withdraw rather than delete: their lesson completions stay intact in case they return.
  async withdrawStudent(user: AuthenticatedUser, cohortId: string, studentId: string) {
    await this.assertCanManageCohort(user, cohortId);

    const enrollment = await this.prisma.cohortEnrollment.findFirst({
      where: { cohortId, studentId },
      select: { id: true },
    });
    if (!enrollment) {
      throw new NotFoundException("That student is not in this cohort");
    }

    await this.prisma.cohortEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "withdrawn" },
    });

    return { studentId, status: "withdrawn" };
  }

  async createModule(user: AuthenticatedUser, cohortId: string, title: string) {
    await this.assertCanManageCohort(user, cohortId);

    const last = await this.prisma.module.findFirst({
      where: { cohortId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return this.prisma.module.create({
      data: { cohortId, title: title.trim(), order: (last?.order ?? 0) + 1 },
      select: { id: true, title: true, order: true },
    });
  }

  async renameModule(user: AuthenticatedUser, moduleId: string, title: string) {
    const module = await this.findModuleOrThrow(moduleId);
    await this.assertCanManageCohort(user, module.cohortId);

    return this.prisma.module.update({
      where: { id: moduleId },
      data: { title: title.trim() },
      select: { id: true, title: true, order: true },
    });
  }

  async deleteModule(user: AuthenticatedUser, moduleId: string) {
    const module = await this.findModuleOrThrow(moduleId);
    await this.assertCanManageCohort(user, module.cohortId);

    // Lessons (and their completions/evidence) cascade from the schema's onDelete: Cascade.
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { id: moduleId, deleted: true };
  }

  async createLesson(user: AuthenticatedUser, moduleId: string, title: string) {
    const module = await this.findModuleOrThrow(moduleId);
    await this.assertCanManageCohort(user, module.cohortId);

    const last = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return this.prisma.lesson.create({
      // `content` is required by the schema but there's no lesson-body editor yet.
      data: { moduleId, title: title.trim(), content: "", order: (last?.order ?? 0) + 1 },
      select: { id: true, title: true, order: true },
    });
  }

  async renameLesson(user: AuthenticatedUser, lessonId: string, title: string) {
    await this.assertCanManageLesson(user, lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { title: title.trim() },
      select: { id: true, title: true, order: true },
    });
  }

  async deleteLesson(user: AuthenticatedUser, lessonId: string) {
    await this.assertCanManageLesson(user, lessonId);

    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { id: lessonId, deleted: true };
  }

  private async findModuleOrThrow(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true, cohortId: true },
    });
    if (!module) {
      throw new NotFoundException("Module not found");
    }
    return module;
  }

  private async assertCanManageLesson(user: AuthenticatedUser, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, module: { select: { cohortId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    await this.assertCanManageCohort(user, lesson.module.cohortId);
    return lesson;
  }

  // SUPER_ADMIN manages any cohort; a MENTOR only the ones they're assigned to, so one
  // mentor can't edit another's study plan. The route guard already excludes STUDENT.
  private async assertCanManageCohort(user: AuthenticatedUser, cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    const assigned = await this.prisma.cohortMentorAssignment.findFirst({
      where: { cohortId, mentorProfile: { userId: user.id } },
      select: { id: true },
    });
    if (!assigned) {
      throw new ForbiddenException("You are not assigned to this cohort");
    }
  }

  // Lessons a student has marked done, grouped by cohort — one query for any number
  // of cohorts (listMyCohorts scans several at once; the modules endpoint just one).
  private async completedLessonIdsByCohort(studentId: string, cohortIds: string[]) {
    const completions = await this.prisma.lessonCompletion.findMany({
      where: { studentId, cohortId: { in: cohortIds } },
      select: { cohortId: true, lessonId: true },
    });

    const byCohort = new Map<string, Set<string>>();
    for (const { cohortId, lessonId } of completions) {
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
