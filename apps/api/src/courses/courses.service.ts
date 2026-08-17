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
    // An admin isn't enrolled in or assigned to anything, but manages everything —
    // without this they'd land on an empty "My Cohorts" page.
    if (user.role === Role.SUPER_ADMIN) {
      const cohorts = await this.prisma.cohort.findMany({
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          course: { select: { id: true, title: true } },
          modules: {
            select: {
              lessons: {
                where: { scheduledAt: { not: null } },
                orderBy: { scheduledAt: "asc" },
                take: 1,
                select: { scheduledAt: true },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
      });
      return cohorts.map(({ modules, ...cohort }) => ({
        ...cohort,
        firstClassDate: earliestScheduledAt(modules),
      }));
    }

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
              modules: {
                select: {
                  lessons: {
                    where: { scheduledAt: { not: null } },
                    orderBy: { scheduledAt: "asc" },
                    take: 1,
                    select: { scheduledAt: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { cohort: { startDate: "desc" } },
      });
      // A mentor has no personal progress, so no `progress` field here — the frontend
      // CohortCard renders without a progress bar when it's absent.
      return assignments.map(({ cohort }) => {
        const { modules, ...rest } = cohort;
        return { ...rest, firstClassDate: earliestScheduledAt(modules) };
      });
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
            modules: { select: { lessons: { select: { id: true, scheduledAt: true, cancelled: true } } } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const now = new Date();

    return enrollments.map(({ cohort }) => {
      // Cancelled classes count for nothing on either side of the fraction.
      const lessons = cohort.modules.flatMap((m) => m.lessons).filter((l) => !l.cancelled);
      const completedLessons = lessons.filter((l) => hasHappened(l, now)).length;

      // Same rule as the cohort header: the first dated class is the real start.
      const scheduled = lessons
        .map((l) => l.scheduledAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      return {
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        firstClassDate: scheduled[0] ?? null,
        course: cohort.course,
        progress: progressOf(completedLessons, lessons.length),
      };
    });
  }

  // Counts for the cohort header.
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

    const now = new Date();
    const [studentCount, lessonCount, taughtCount, elapsedCount, firstScheduledLesson] = await Promise.all([
      this.prisma.cohortEnrollment.count({ where: { cohortId, status: "active" } }),
      this.prisma.lesson.count({ where: { module: { cohortId }, cancelled: false } }),
      // "Taught" and "elapsed" are the same question now, both answered by the clock.
      this.prisma.lesson.count({
        where: { module: { cohortId }, cancelled: false, scheduledAt: { not: null, lte: now } },
      }),
      this.prisma.lesson.count({
        where: { module: { cohortId }, cancelled: false, scheduledAt: { not: null, lte: now } },
      }),
      // The earliest dated class is when teaching actually begins, which is what the
      // header should show — the cohort's own startDate is admin-set and drifts out of
      // step with the schedule once classes are planned.
      this.prisma.lesson.findFirst({
        where: { module: { cohortId }, cancelled: false, scheduledAt: { not: null } },
        orderBy: { scheduledAt: "asc" },
        select: { scheduledAt: true },
      }),
    ]);

    const { _count, ...cohortFields } = cohort;

    return {
      ...cohortFields,
      moduleCount: _count.modules,
      studentCount,
      lessonCount,
      taughtCount,
      // Null when no class has a date yet; the UI falls back to startDate.
      firstClassDate: firstScheduledLesson?.scheduledAt ?? null,
      myProgressPercent:
        user.role === Role.STUDENT && lessonCount > 0 ? Math.round((elapsedCount / lessonCount) * 100) : null,
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
          select: {
            id: true,
            title: true,
            order: true,
            // The mentor-written summary of what the class covers.
            content: true,
            slidesUrl: true,
            assignmentsUrl: true,
            scheduledAt: true,
            submissionRequired: true,
            cancelled: true,
          },
          // Scheduled classes run in date order; undated ones fall to the end.
          orderBy: [{ scheduledAt: { sort: "asc", nulls: "last" } }, { order: "asc" }],
        },
      },
      orderBy: { order: "asc" },
    });

    const now = new Date();

    // Both "taught" and "completed" come from the clock: a scheduled class whose time has
    // passed, and which wasn't called off, has happened. Nobody ticks anything.
    const modules = rows.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({ ...lesson, taught: hasHappened(lesson, now) })),
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

    return modules.map((module) => {
      const lessons = module.lessons.map((lesson) => ({ ...lesson, completed: lesson.taught }));
      // Cancelled classes drop out of the denominator too — a student can't be behind on
      // something that never ran.
      const counted = lessons.filter((l) => !l.cancelled);
      const completedLessons = counted.filter((l) => l.completed).length;

      return { ...module, lessons, ...progressOf(completedLessons, counted.length) };
    });
  }

  async updateLessonSlidesUrl(user: AuthenticatedUser, lessonId: string, slidesUrl?: string) {
    await this.assertCanManageLesson(user, lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { slidesUrl: slidesUrl?.trim() || null },
      select: { id: true, slidesUrl: true },
    });
  }

  async updateLessonAssignmentsUrl(user: AuthenticatedUser, lessonId: string, assignmentsUrl?: string) {
    await this.assertCanManageLesson(user, lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { assignmentsUrl: assignmentsUrl?.trim() || null },
      select: { id: true, assignmentsUrl: true },
    });
  }

  // Calling a class off. The only delivery fact a mentor has to record — whether a class
  // that *wasn't* cancelled has been taught follows from its scheduled time.
  async setLessonCancelled(user: AuthenticatedUser, lessonId: string, cancelled: boolean) {
    await this.assertCanManageLesson(user, lessonId);

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { cancelled },
    });

    return { lessonId, cancelled };
  }

  // The cohort roster. Progress is derived from the schedule rather than from anything a
  // student does, so every row in a cohort shows the same figures — it reads as "how far
  // the cohort has got", not as a per-student ranking.
  async listCohortStudents(user: AuthenticatedUser, cohortId: string) {
    await this.assertCanManageCohort(user, cohortId);

    const now = new Date();
    const [lessonCount, elapsedCount, enrollments] = await Promise.all([
      this.prisma.lesson.count({ where: { module: { cohortId }, cancelled: false } }),
      this.prisma.lesson.count({
        where: { module: { cohortId }, cancelled: false, scheduledAt: { not: null, lte: now } },
      }),
      this.prisma.cohortEnrollment.findMany({
        where: { cohortId },
        select: {
          status: true,
          enrolledAt: true,
          student: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { enrolledAt: "asc" },
      }),
    ]);

    return enrollments.map((enrollment) => ({
      studentId: enrollment.student.id,
      email: enrollment.student.email,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedLessons: elapsedCount,
      totalLessons: lessonCount,
      percent: lessonCount === 0 ? 0 : Math.round((elapsedCount / lessonCount) * 100),
    }));
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

  async enrollSelf(user: AuthenticatedUser, cohortId: string) {
    if (user.role !== Role.STUDENT) {
      throw new ForbiddenException("Only students can self-enroll");
    }

    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    const existing = await this.prisma.cohortEnrollment.findFirst({
      where: { cohortId, studentId: user.id },
      select: { id: true, status: true },
    });

    if (existing) {
      if (existing.status === "active") {
        throw new ConflictException("You are already in this cohort");
      }
      await this.prisma.cohortEnrollment.update({
        where: { id: existing.id },
        data: { status: "active" },
      });
    } else {
      await this.prisma.cohortEnrollment.create({
        data: { cohortId, studentId: user.id, status: "active" },
      });
    }

    return { studentId: user.id, email: user.email, status: "active" };
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

  async updateModule(user: AuthenticatedUser, moduleId: string, title: string) {
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

  async createLesson(user: AuthenticatedUser, moduleId: string, title: string, scheduledAt?: string) {
    const module = await this.findModuleOrThrow(moduleId);
    await this.assertCanManageCohort(user, module.cohortId);

    const last = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return this.prisma.lesson.create({
      // `content` is required by the schema but there's no lesson-body editor yet.
      data: {
        moduleId,
        title: title.trim(),
        content: "",
        order: (last?.order ?? 0) + 1,
        scheduledAt: parseScheduledAt(scheduledAt),
      },
      select: { id: true, title: true, order: true, scheduledAt: true },
    });
  }

  async updateLesson(
    user: AuthenticatedUser,
    lessonId: string,
    title: string,
    scheduledAt?: string,
    content?: string,
    submissionRequired?: boolean,
  ) {
    await this.assertCanManageLesson(user, lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title.trim(),
        // Undefined leaves the existing value alone; an empty string clears it.
        ...(scheduledAt !== undefined ? { scheduledAt: parseScheduledAt(scheduledAt) } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(submissionRequired !== undefined ? { submissionRequired } : {}),
      },
      select: {
        id: true,
        title: true,
        order: true,
        scheduledAt: true,
        content: true,
        submissionRequired: true,
      },
    });
  }

  async deleteLesson(user: AuthenticatedUser, lessonId: string) {
    await this.assertCanManageLesson(user, lessonId);

    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { id: lessonId, deleted: true };
  }

  // Mentor/admin only — students never read feedback back, not even their own, so there
  // is no student-facing read path at all.
  async listCohortFeedback(user: AuthenticatedUser, cohortId: string) {
    await this.assertCanManageCohort(user, cohortId);

    const feedback = await this.prisma.lessonFeedback.findMany({
      where: { cohortId },
      select: {
        id: true,
        body: true,
        createdAt: true,
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return feedback.map((entry) => ({
      id: entry.id,
      body: entry.body,
      createdAt: entry.createdAt,
      student: entry.student,
      lessonId: entry.lesson.id,
      lessonTitle: entry.lesson.title,
      moduleTitle: entry.lesson.module.title,
    }));
  }

  async postFeedback(user: AuthenticatedUser, lessonId: string, body: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, module: { select: { cohortId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    const cohortId = lesson.module.cohortId;
    await this.assertEnrolled(user.id, cohortId);

    await this.prisma.lessonFeedback.create({
      data: { lessonId, cohortId, studentId: user.id, body: body.trim() },
    });

    // Nothing about the stored row is returned: the student can't read feedback back,
    // so the response is just an acknowledgement that it was sent.
    return { sent: true };
  }

  // Mentors/admins can clear feedback from their own cohorts. Students have no delete
  // path — they can't even read it back, let alone remove it after sending.
  async deleteFeedback(user: AuthenticatedUser, feedbackId: string) {
    const feedback = await this.prisma.lessonFeedback.findUnique({
      where: { id: feedbackId },
      select: { id: true, cohortId: true },
    });
    if (!feedback) {
      throw new NotFoundException("Feedback not found");
    }
    await this.assertCanManageCohort(user, feedback.cohortId);

    await this.prisma.lessonFeedback.delete({ where: { id: feedbackId } });
    return { id: feedbackId, deleted: true };
  }

  // A student's progress in a cohort, shaped around the ProgressSignal design: several
  // named signals, each normalized 0-1, blended by weight into one figure.
  //
  // Only `evidence_submitted` is wired up today — attendance, review scores and quizzes
  // have models but no write path, so they report `active: false` and are excluded from
  // the blend rather than contributing a fake zero. As each one is built it flips to
  // active and starts counting, without the shape of this response changing.
  async getCohortProgress(cohortId: string, user: AuthenticatedUser) {
    if (user.role === Role.STUDENT) {
      await this.assertEnrolled(user.id, cohortId);
    } else {
      await this.assertCanManageCohort(user, cohortId);
    }

    const now = new Date();
    const [lessonCount, elapsedCount, dueLessons, submittedLessonIds] = await Promise.all([
      this.prisma.lesson.count({ where: { module: { cohortId }, cancelled: false } }),
      this.prisma.lesson.count({
        where: { module: { cohortId }, cancelled: false, scheduledAt: { not: null, lte: now } },
      }),
      // Only classes that actually ask for work, and only once they've happened — a
      // submission isn't late (or missing) before its class has run.
      this.prisma.lesson.findMany({
        where: {
          module: { cohortId },
          cancelled: false,
          submissionRequired: true,
          scheduledAt: { not: null, lte: now },
        },
        select: { id: true },
      }),
      user.role === Role.STUDENT
        ? this.prisma.evidence
            .findMany({
              where: { cohortId, studentId: user.id },
              select: { lessonId: true },
              distinct: ["lessonId"],
            })
            .then((rows) => rows.map((r) => r.lessonId))
        : Promise.resolve([]),
    ]);

    const submitted = new Set(submittedLessonIds);
    const expected = dueLessons.length;
    const done = dueLessons.filter((l) => submitted.has(l.id)).length;

    const signals = [
      {
        type: "evidence_submitted",
        label: "Work submitted",
        description: "Classes that asked for work, and whether you handed it in.",
        active: true,
        // Nothing due yet reads as complete rather than as a zero the student can't act on.
        value: expected === 0 ? 1 : done / expected,
        weight: 1,
        detail: { completed: done, total: expected },
      },
      {
        type: "attendance",
        label: "Attendance",
        description: "Turning up to scheduled classes.",
        active: false,
        value: null,
        weight: 0,
        detail: null,
      },
      {
        type: "review_score",
        label: "Mentor reviews",
        description: "Scores your mentor gives the work you submit.",
        active: false,
        value: null,
        weight: 0,
        detail: null,
      },
      {
        type: "quiz_score",
        label: "Quizzes",
        description: "How you score on quizzes for each class.",
        active: false,
        value: null,
        weight: 0,
        detail: null,
      },
    ];

    const live = signals.filter((s) => s.active && s.value !== null);
    const totalWeight = live.reduce((sum, s) => sum + s.weight, 0);
    const overall =
      totalWeight === 0 ? 0 : live.reduce((sum, s) => sum + (s.value as number) * s.weight, 0) / totalWeight;

    return {
      // The student's own figure — what they've done.
      overallPercent: Math.round(overall * 100),
      // The cohort's position in its own schedule. Identical for everyone in the cohort,
      // and deliberately kept separate from the figure above.
      schedulePercent: lessonCount === 0 ? 0 : Math.round((elapsedCount / lessonCount) * 100),
      elapsedLessons: elapsedCount,
      totalLessons: lessonCount,
      signals,
    };
  }

  // Work a student hands in for a class. Backed by Evidence, which already models exactly
  // this — a link plus metadata, scoped to a lesson and cohort, reviewable by a mentor.
  async createSubmission(user: AuthenticatedUser, lessonId: string, url: string, note?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, module: { select: { cohortId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException("Class not found");
    }
    const cohortId = lesson.module.cohortId;
    await this.assertEnrolled(user.id, cohortId);

    const submission = await this.prisma.evidence.create({
      data: {
        studentId: user.id,
        lessonId,
        cohortId,
        evidenceType: "link",
        externalUrl: url.trim(),
        metadata: note?.trim() ? { note: note.trim() } : {},
      },
      select: { id: true, externalUrl: true, submittedAt: true, status: true },
    });

    return submission;
  }

  // A student's own submissions for a cohort. Students see only their own; mentors and
  // admins managing the cohort see everyone's.
  async listSubmissions(user: AuthenticatedUser, cohortId: string) {
    if (user.role === Role.STUDENT) {
      await this.assertEnrolled(user.id, cohortId);
    } else {
      await this.assertCanManageCohort(user, cohortId);
    }

    const rows = await this.prisma.evidence.findMany({
      where: {
        cohortId,
        ...(user.role === Role.STUDENT ? { studentId: user.id } : {}),
      },
      select: {
        id: true,
        externalUrl: true,
        metadata: true,
        submittedAt: true,
        status: true,
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        lesson: { select: { id: true, title: true, module: { select: { title: true } } } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      url: row.externalUrl,
      note: (row.metadata as { note?: string } | null)?.note ?? null,
      submittedAt: row.submittedAt,
      status: row.status,
      student: row.student,
      lessonId: row.lesson.id,
      lessonTitle: row.lesson.title,
      moduleTitle: row.lesson.module.title,
    }));
  }

  // A student can retract their own submission; mentors and admins can clear any in a
  // cohort they manage.
  async deleteSubmission(user: AuthenticatedUser, submissionId: string) {
    const submission = await this.prisma.evidence.findUnique({
      where: { id: submissionId },
      select: { id: true, cohortId: true, studentId: true },
    });
    if (!submission) {
      throw new NotFoundException("Submission not found");
    }

    if (user.role === Role.STUDENT) {
      if (submission.studentId !== user.id) {
        throw new ForbiddenException("That isn't your submission");
      }
    } else {
      await this.assertCanManageCohort(user, submission.cohortId);
    }

    await this.prisma.evidence.delete({ where: { id: submissionId } });
    return { id: submissionId, deleted: true };
  }

  private async assertEnrolled(studentId: string, cohortId: string) {
    const enrolled = await this.prisma.cohortEnrollment.findFirst({
      where: { studentId, cohortId, status: "active" },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException("You are not enrolled in this cohort");
    }
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

}

// "" clears the date. A date-only string ("2026-07-14") is anchored to midday UTC so it
// can't drift to the previous day for users behind UTC; anything with a time component
// (what <input type="datetime-local"> sends) is taken as given.
function parseScheduledAt(value?: string): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T12:00:00.000Z` : trimmed;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException("scheduledAt must be a valid date");
  }
  return date;
}

// A class has happened once its scheduled moment has passed, unless it was called off.
// Undated classes never count — there is nothing to compare against.
function hasHappened(lesson: { scheduledAt: Date | null; cancelled: boolean }, now: Date): boolean {
  return !lesson.cancelled && lesson.scheduledAt !== null && lesson.scheduledAt.getTime() <= now.getTime();
}

// The earliest scheduled class across a cohort's modules — when teaching actually begins.
function earliestScheduledAt(modules: { lessons: { scheduledAt: Date | null }[] }[]): Date | null {
  const dates = modules
    .flatMap((m) => m.lessons.map((l) => l.scheduledAt))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  return dates[0] ?? null;
}

function progressOf(completedLessons: number, totalLessons: number) {
  return {
    completedLessons,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
  };
}
