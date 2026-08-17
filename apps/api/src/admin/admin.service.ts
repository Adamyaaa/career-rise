import { randomUUID } from "crypto";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import {
  AssignMentorDto,
  CreateCohortDto,
  CreateCourseDto,
  CreateUserDto,
  UpdateCohortDto,
  UpdateCourseDto,
  UpdateUserDto,
} from "./dto/admin.dto";

const BCRYPT_ROUNDS = 10;
const DEFAULT_MENTOR_CAPACITY = 20;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- users

  async listUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        mentorProfile: { select: { id: true, cohortAssignments: { select: { cohortId: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    });

    return users.map(({ mentorProfile, _count, ...user }) => ({
      ...user,
      cohortCount: user.role === Role.MENTOR ? (mentorProfile?.cohortAssignments.length ?? 0) : _count.enrollments,
    }));
  }

  // Creates the account only — no password is ever set or transmitted. The person signs
  // in with an emailed OTP, which is why passwordHash gets an unusable random value
  // rather than something guessable.
  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new ConflictException("An account with that email already exists");
    }

    const passwordHash = await bcrypt.hash(randomUUID() + randomUUID(), BCRYPT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: dto.role,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() || null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      });

      await this.ensureProfileForRole(tx, user.id, dto.role, dto.specializations);
      return user;
    });
  }

  async updateUser(actor: AuthenticatedUser, userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Without this an admin could demote or disable their own account and lock
    // everyone out of the admin area, with no way back short of a database edit.
    const isSelf = actor.id === userId;
    if (isSelf && dto.role && dto.role !== Role.SUPER_ADMIN) {
      throw new BadRequestException("You can't change your own role");
    }
    if (isSelf && dto.isActive === false) {
      throw new BadRequestException("You can't deactivate your own account");
    }

    if (user.role === Role.SUPER_ADMIN && dto.role && dto.role !== Role.SUPER_ADMIN) {
      await this.assertNotLastActiveAdmin(userId);
    }
    if (user.role === Role.SUPER_ADMIN && dto.isActive === false) {
      await this.assertNotLastActiveAdmin(userId);
    }

    if (dto.email) {
      const clash = await this.prisma.user.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (clash && clash.id !== userId) {
        throw new ConflictException("Another account already uses that email");
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          ...(dto.role ? { role: dto.role } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
          ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
      });

      // A promoted student needs a MentorProfile before they can be assigned anywhere.
      // The old profile is left in place so their history survives a demotion.
      if (dto.role) {
        await this.ensureProfileForRole(tx, userId, dto.role);
      }
      if (dto.specializations && (dto.role ?? user.role) === Role.MENTOR) {
        await tx.mentorProfile.update({
          where: { userId },
          data: { specializations: dto.specializations },
        });
      }
      return updated;
    });
  }

  // Hard delete. Everything they produced goes with them via the schema's cascades —
  // enrolments, lesson completions, evidence, feedback and uploaded files. Deactivating
  // is the reversible alternative and is what the UI recommends.
  async deleteUser(actor: AuthenticatedUser, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (actor.id === userId) {
      throw new BadRequestException("You can't delete your own account");
    }
    if (user.role === Role.SUPER_ADMIN) {
      await this.assertNotLastActiveAdmin(userId);
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { id: userId, deleted: true };
  }

  // --------------------------------------------------------------- courses

  listCourses() {
    return this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        _count: { select: { cohorts: true } },
      },
      orderBy: { title: "asc" },
    });
  }

  createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        category: dto.category ?? [],
      },
      select: { id: true, title: true, description: true, category: true },
    });
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    await this.findCourseOrThrow(courseId);
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
      },
      select: { id: true, title: true, description: true, category: true },
    });
  }

  async deleteCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, _count: { select: { cohorts: true } } },
    });
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    // Deleting would cascade through cohorts to enrolments, progress and feedback.
    if (course._count.cohorts > 0) {
      throw new BadRequestException("Delete this course's cohorts first");
    }

    await this.prisma.course.delete({ where: { id: courseId } });
    return { id: courseId, deleted: true };
  }

  // --------------------------------------------------------------- cohorts

  async listCohorts() {
    const cohorts = await this.prisma.cohort.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        course: { select: { id: true, title: true } },
        mentorAssignments: {
          select: {
            mentorProfile: {
              select: { id: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
            },
          },
        },
        // Earliest dated class — the real first class, shown in place of the admin-set
        // startDate so this list agrees with the cohort header.
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
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return cohorts.map((cohort) => ({
      id: cohort.id,
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      firstClassDate:
        cohort.modules
          .flatMap((m) => m.lessons.map((l) => l.scheduledAt))
          .filter((d): d is Date => d !== null)
          .sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
      course: cohort.course,
      studentCount: cohort._count.enrollments,
      moduleCount: cohort._count.modules,
      mentors: cohort.mentorAssignments.map((a) => a.mentorProfile.user),
    }));
  }

  async createCohort(dto: CreateCohortDto) {
    await this.findCourseOrThrow(dto.courseId);
    const { startDate, endDate } = this.parseRange(dto.startDate, dto.endDate);

    return this.prisma.cohort.create({
      data: { courseId: dto.courseId, name: dto.name.trim(), startDate, endDate },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  }

  async updateCohort(cohortId: string, dto: UpdateCohortDto) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true, startDate: true, endDate: true },
    });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    // Validate against whichever end of the range isn't being changed.
    const { startDate, endDate } = this.parseRange(
      dto.startDate ?? cohort.startDate.toISOString(),
      dto.endDate ?? cohort.endDate.toISOString(),
    );

    return this.prisma.cohort.update({
      where: { id: cohortId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.startDate !== undefined ? { startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate } : {}),
      },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  }

  async deleteCohort(cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true, _count: { select: { enrollments: true } } },
    });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }
    if (cohort._count.enrollments > 0) {
      throw new BadRequestException("Remove the enrolled students before deleting this cohort");
    }

    await this.prisma.cohort.delete({ where: { id: cohortId } });
    return { id: cohortId, deleted: true };
  }

  async assignMentor(cohortId: string, dto: AssignMentorDto) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true } });
    if (!cohort) {
      throw new NotFoundException("Cohort not found");
    }

    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorUserId },
      select: { id: true, role: true, isActive: true, mentorProfile: { select: { id: true } } },
    });
    if (!mentor) {
      throw new NotFoundException("User not found");
    }
    if (mentor.role !== Role.MENTOR) {
      throw new BadRequestException("Only mentors can be assigned to a cohort");
    }
    if (!mentor.isActive) {
      throw new BadRequestException("That mentor's account is deactivated");
    }

    // Older mentor accounts may predate their profile; create it rather than failing.
    const mentorProfileId =
      mentor.mentorProfile?.id ??
      (
        await this.prisma.mentorProfile.create({
          data: { userId: mentor.id, specializations: [], capacity: DEFAULT_MENTOR_CAPACITY },
          select: { id: true },
        })
      ).id;

    const existing = await this.prisma.cohortMentorAssignment.findFirst({
      where: { cohortId, mentorProfileId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("That mentor is already on this cohort");
    }

    await this.prisma.cohortMentorAssignment.create({ data: { cohortId, mentorProfileId } });
    return { cohortId, mentorUserId: mentor.id, assigned: true };
  }

  async unassignMentor(cohortId: string, mentorUserId: string) {
    const assignment = await this.prisma.cohortMentorAssignment.findFirst({
      where: { cohortId, mentorProfile: { userId: mentorUserId } },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("That mentor is not on this cohort");
    }

    await this.prisma.cohortMentorAssignment.delete({ where: { id: assignment.id } });
    return { cohortId, mentorUserId, assigned: false };
  }

  // --------------------------------------------------------------- helpers

  private async ensureProfileForRole(
    tx: Prisma.TransactionClient,
    userId: string,
    role: Role,
    specializations?: string[],
  ) {
    if (role === Role.STUDENT) {
      await tx.studentProfile.upsert({ where: { userId }, update: {}, create: { userId } });
    } else if (role === Role.MENTOR) {
      await tx.mentorProfile.upsert({
        where: { userId },
        update: specializations ? { specializations } : {},
        create: { userId, specializations: specializations ?? [], capacity: DEFAULT_MENTOR_CAPACITY },
      });
    }
    // SUPER_ADMIN has no profile model.
  }

  private async assertNotLastActiveAdmin(userId: string) {
    const others = await this.prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true, id: { not: userId } },
    });
    if (others === 0) {
      throw new BadRequestException("This is the last active admin — promote another one first");
    }
  }

  private async findCourseOrThrow(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    return course;
  }

  private parseRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid start or end date");
    }
    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after the start date");
    }
    return { startDate, endDate };
  }
}
