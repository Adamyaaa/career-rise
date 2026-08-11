import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CreateAnnouncementDto, UpdateAnnouncementDto } from "./dto/announcement.dto";

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  // Students read their own cohort's announcements; mentors/admins read the ones they
  // manage. Both go through the same access check, just from different directions.
  async list(user: AuthenticatedUser, cohortId: string) {
    await this.assertCanRead(user, cohortId);

    const announcements = await this.prisma.announcement.findMany({
      where: { cohortId },
      select: {
        id: true,
        title: true,
        content: true,
        link: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Newest first — an announcement matters most the day it's posted.
    return announcements;
  }

  async create(user: AuthenticatedUser, cohortId: string, dto: CreateAnnouncementDto) {
    await this.assertCanManage(user, cohortId);

    return this.prisma.announcement.create({
      data: {
        cohortId,
        authorId: user.id,
        title: dto.title.trim(),
        content: dto.content.trim(),
        link: dto.link?.trim() || null,
      },
      select: { id: true, title: true, content: true, link: true, createdAt: true },
    });
  }

  async update(user: AuthenticatedUser, announcementId: string, dto: UpdateAnnouncementDto) {
    const existing = await this.findOrThrow(announcementId);
    await this.assertCanManage(user, existing.cohortId);

    return this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
        // Undefined leaves the link alone; an empty string removes it.
        ...(dto.link !== undefined ? { link: dto.link.trim() || null } : {}),
      },
      select: { id: true, title: true, content: true, link: true, updatedAt: true },
    });
  }

  async remove(user: AuthenticatedUser, announcementId: string) {
    const existing = await this.findOrThrow(announcementId);
    await this.assertCanManage(user, existing.cohortId);

    await this.prisma.announcement.delete({ where: { id: announcementId } });
    return { id: announcementId, deleted: true };
  }

  private async findOrThrow(announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true, cohortId: true },
    });
    if (!announcement) {
      throw new NotFoundException("Announcement not found");
    }
    return announcement;
  }

  private async assertCanRead(user: AuthenticatedUser, cohortId: string) {
    if (user.role === Role.STUDENT) {
      const enrolled = await this.prisma.cohortEnrollment.findFirst({
        where: { studentId: user.id, cohortId, status: "active" },
        select: { id: true },
      });
      if (!enrolled) {
        throw new ForbiddenException("You are not enrolled in this cohort");
      }
      return;
    }
    await this.assertCanManage(user, cohortId);
  }

  // Same rule as the rest of the cohort surface: admins manage any cohort, a mentor
  // only the ones they're assigned to.
  private async assertCanManage(user: AuthenticatedUser, cohortId: string) {
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
