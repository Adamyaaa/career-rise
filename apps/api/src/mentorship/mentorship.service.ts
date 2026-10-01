import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMentorshipApplicationDto } from "./dto/create-application.dto";
import { ApproveMentorshipApplicationDto } from "./dto/approve-application.dto";
import { UpdateMentorshipSessionDto } from "./dto/update-session.dto";
import { PRO_12_WEEK_CURRICULUM } from "./constants/pro-curriculum";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Injectable()
export class MentorshipService {
  constructor(private prisma: PrismaService) {}

  async createApplication(data: CreateMentorshipApplicationDto) {
    return this.prisma.mentorshipApplication.create({
      data,
    });
  }

  async listApplications() {
    return this.prisma.mentorshipApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async rejectApplication(id: string) {
    return this.prisma.mentorshipApplication.update({
      where: { id },
      data: { status: "rejected" },
    });
  }

  async approveApplication(id: string, dto: ApproveMentorshipApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.mentorshipApplication.findUnique({
        where: { id },
      });

      if (!app) {
        throw new NotFoundException("Application not found");
      }

      // Find user by email
      const studentUser = await tx.user.findUnique({
        where: { email: app.email },
      });

      if (!studentUser) {
        throw new BadRequestException(
          `No registered user found with email "${app.email}". The student must create an account first.`,
        );
      }

      // Check if student already has a track
      let track = await tx.proMentorshipTrack.findUnique({
        where: { studentId: studentUser.id },
      });

      if (!track) {
        const createdTrack = await tx.proMentorshipTrack.create({
          data: {
            studentId: studentUser.id,
            seniorMentorId: dto.seniorMentorId || null,
            targetRole: dto.targetRole || app.targetRole,
            targetCompany: dto.targetCompany || null,
            status: "active",
          },
        });

        // Initialize the 12 personal session records
        await tx.personalMentorshipSession.createMany({
          data: PRO_12_WEEK_CURRICULUM.map((s) => ({
            trackId: createdTrack.id,
            weekNumber: s.weekNumber,
            title: s.title,
            format: s.format,
            mentorType: s.mentorType,
            durationMins: s.durationMins,
            status: "not_scheduled",
          })),
        });

        track = createdTrack;
      } else {
        // Reactivate / update existing track if re-approved
        track = await tx.proMentorshipTrack.update({
          where: { id: track.id },
          data: {
            status: "active",
            seniorMentorId: dto.seniorMentorId || track.seniorMentorId,
            targetRole: dto.targetRole || track.targetRole,
            targetCompany: dto.targetCompany || track.targetCompany,
          },
        });
      }

      // Mark application as approved
      await tx.mentorshipApplication.update({
        where: { id },
        data: { status: "approved" },
      });

      return tx.proMentorshipTrack.findUnique({
        where: { id: track.id },
        include: {
          sessions: { orderBy: { weekNumber: "asc" } },
          seniorMentor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    });
  }

  async getMyTrack(user: AuthenticatedUser) {
    const track = await this.prisma.proMentorshipTrack.findUnique({
      where: { studentId: user.id },
      include: {
        sessions: { orderBy: { weekNumber: "asc" } },
        seniorMentor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (track && track.status === "active") {
      return {
        isApproved: true,
        track,
      };
    }

    // Check application status if not enrolled
    const app = await this.prisma.mentorshipApplication.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
    });

    return {
      isApproved: false,
      applicationStatus: app ? app.status : "not_applied",
      application: app,
    };
  }

  async getTrackById(trackId: string, user: AuthenticatedUser) {
    const track = await this.prisma.proMentorshipTrack.findUnique({
      where: { id: trackId },
      include: {
        sessions: { orderBy: { weekNumber: "asc" } },
        student: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        seniorMentor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!track) {
      throw new NotFoundException("Pro Mentorship Track not found");
    }

    // Access control: only super admins, the assigned mentor, or the student themselves can view
    if (
      user.role !== "SUPER_ADMIN" &&
      track.seniorMentorId !== user.id &&
      track.studentId !== user.id
    ) {
      throw new ForbiddenException("You do not have permission to view this personal mentorship record");
    }

    return track;
  }

  async listAllTracks() {
    return this.prisma.proMentorshipTrack.findMany({
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        seniorMentor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        sessions: {
          orderBy: { weekNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listMentorTracks(mentorUserId: string) {
    return this.prisma.proMentorshipTrack.findMany({
      where: { seniorMentorId: mentorUserId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        sessions: {
          orderBy: { weekNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSessionById(sessionId: string, user: AuthenticatedUser) {
    const session = await this.prisma.personalMentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            seniorMentor: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            sessions: {
              orderBy: { weekNumber: "asc" },
              select: { id: true, weekNumber: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Mentorship session not found");
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      session.track.seniorMentorId !== user.id &&
      session.track.studentId !== user.id
    ) {
      throw new ForbiddenException("You cannot view this personal mentorship session");
    }

    return session;
  }

  async updateSession(sessionId: string, user: AuthenticatedUser, dto: UpdateMentorshipSessionDto) {
    const session = await this.prisma.personalMentorshipSession.findUnique({
      where: { id: sessionId },
      include: { track: true },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isAssignedMentor = session.track.seniorMentorId === user.id;
    const isStudentOwner = session.track.studentId === user.id;

    if (!isSuperAdmin && !isAssignedMentor && !isStudentOwner) {
      throw new ForbiddenException("You cannot edit this mentorship session");
    }

    const data: any = {};

    // Student can only update their own notes and action items checklist
    if (isStudentOwner && !isSuperAdmin && !isAssignedMentor) {
      if (dto.studentNotes !== undefined) data.studentNotes = dto.studentNotes;
      if (dto.actionItems !== undefined) data.actionItems = dto.actionItems;
    } else {
      // Mentor & Super Admin can update everything
      if (dto.scheduledAt !== undefined) data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
      if (dto.durationMins !== undefined) data.durationMins = dto.durationMins;
      if (dto.status !== undefined) {
        data.status = dto.status;
        if (dto.status === "completed" && !session.completedAt) {
          data.completedAt = new Date();
        } else if (dto.status !== "completed") {
          data.completedAt = null;
        }
      }
      if (dto.meetingUrl !== undefined) data.meetingUrl = dto.meetingUrl;
      if (dto.recordingUrl !== undefined) data.recordingUrl = dto.recordingUrl;
      if (dto.deliverables !== undefined) data.deliverables = dto.deliverables;
      if (dto.mentorFeedback !== undefined) data.mentorFeedback = dto.mentorFeedback;
      if (dto.actionItems !== undefined) data.actionItems = dto.actionItems;
      if (dto.studentNotes !== undefined) data.studentNotes = dto.studentNotes;
    }

    return this.prisma.personalMentorshipSession.update({
      where: { id: sessionId },
      data,
    });
  }
}
