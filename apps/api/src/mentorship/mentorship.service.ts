import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from "@nestjs/common";
import * as crypto from "crypto";
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            mentorProfile: { select: { calendlyUrl: true } },
          },
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            mentorProfile: { select: { calendlyUrl: true } },
          },
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
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                mentorProfile: { select: { calendlyUrl: true } },
              },
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

    // Student can update their own notes, action items, or place/cancel a 1:1 session request
    if (isStudentOwner && !isSuperAdmin && !isAssignedMentor) {
      if (dto.studentNotes !== undefined) data.studentNotes = dto.studentNotes;
      if (dto.actionItems !== undefined) data.actionItems = dto.actionItems;
      if (dto.status === "requested" || dto.status === "not_scheduled") {
        data.status = dto.status;
        if (dto.scheduledAt !== undefined) {
          data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
        }
      }
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

  async updateMentorCalendlyUrl(userId: string, calendlyUrl: string) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      return this.prisma.mentorProfile.update({
        where: { userId },
        data: { calendlyUrl: calendlyUrl.trim() || null },
      });
    }

    return this.prisma.mentorProfile.create({
      data: {
        userId,
        specializations: [],
        capacity: 10,
        calendlyUrl: calendlyUrl.trim() || null,
      },
    });
  }

  async getMentorCalendlyUrl(userId: string) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
      select: { calendlyUrl: true },
    });
    return { calendlyUrl: profile?.calendlyUrl || null };
  }

  async handleCalendlyWebhook(body: any, signatureHeader?: string) {
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    if (signingKey && signatureHeader) {
      this.verifyCalendlySignature(body, signatureHeader, signingKey);
    }

    const eventType = body?.event;
    const payload = body?.payload;

    if (!payload) {
      return { status: "ignored", reason: "missing payload" };
    }

    if (eventType === "invitee.created") {
      return this.handleCalendlyInviteeCreated(payload);
    }

    if (eventType === "invitee.canceled") {
      return this.handleCalendlyInviteeCanceled(payload);
    }

    return { status: "ignored", eventType };
  }

  private async handleCalendlyInviteeCreated(payload: any) {
    // 1. Session ID passed via tracking parameters or custom questions
    let sessionId: string | null = null;

    if (payload.tracking) {
      sessionId =
        payload.tracking.utm_term ||
        payload.tracking.utm_content ||
        payload.tracking.utm_campaign ||
        payload.tracking.salesforce_uuid ||
        null;
    }

    if (!sessionId && Array.isArray(payload.questions_and_answers)) {
      const q = payload.questions_and_answers.find(
        (qa: any) =>
          qa.question?.toLowerCase().includes("session") ||
          qa.question?.toLowerCase().includes("id"),
      );
      if (q && q.answer) sessionId = q.answer.trim();
    }

    const studentEmail = payload.email?.toLowerCase().trim();
    let session = null;

    if (sessionId) {
      session = await this.prisma.personalMentorshipSession.findUnique({
        where: { id: sessionId },
        include: { track: true },
      });
    }

    // Fallback: match by student email -> first upcoming unscheduled session
    if (!session && studentEmail) {
      const studentUser = await this.prisma.user.findUnique({
        where: { email: studentEmail },
      });
      if (studentUser) {
        const track = await this.prisma.proMentorshipTrack.findUnique({
          where: { studentId: studentUser.id },
          include: {
            sessions: {
              where: { status: "not_scheduled" },
              orderBy: { weekNumber: "asc" },
              take: 1,
            },
          },
        });
        if (track && track.sessions.length > 0) {
          session = track.sessions[0];
        }
      }
    }

    if (!session) {
      return { status: "unmatched", message: "Could not match session to booking" };
    }

    const scheduledEvent = payload.scheduled_event || {};
    const startTimeStr =
      scheduledEvent.start_time || payload.event_start_time || payload.start_time;
    const scheduledAt = startTimeStr ? new Date(startTimeStr) : new Date();

    // Meeting link (Google Meet / Zoom / Microsoft Teams or custom location)
    let meetingUrl: string | null = null;
    if (scheduledEvent.location) {
      meetingUrl =
        scheduledEvent.location.join_url ||
        (scheduledEvent.location.location?.startsWith("http")
          ? scheduledEvent.location.location
          : null);
    }
    if (!meetingUrl && payload.meeting_url) {
      meetingUrl = payload.meeting_url;
    }

    let durationMins = session.durationMins || 75;
    if (scheduledEvent.start_time && scheduledEvent.end_time) {
      const diffMs =
        new Date(scheduledEvent.end_time).getTime() -
        new Date(scheduledEvent.start_time).getTime();
      const diffMins = Math.round(diffMs / (60 * 1000));
      if (diffMins > 0) durationMins = diffMins;
    }

    const updated = await this.prisma.personalMentorshipSession.update({
      where: { id: session.id },
      data: {
        scheduledAt,
        durationMins,
        meetingUrl: meetingUrl || session.meetingUrl,
        status: "scheduled",
        calendlyEventUri: scheduledEvent.uri || payload.event || null,
        calendlyInviteeUri: payload.uri || null,
      },
    });

    return { status: "success", sessionId: updated.id, scheduledAt };
  }

  private async handleCalendlyInviteeCanceled(payload: any) {
    const inviteeUri = payload.uri;
    const eventUri = payload.event || payload.scheduled_event?.uri;

    let session = null;
    if (inviteeUri) {
      session = await this.prisma.personalMentorshipSession.findFirst({
        where: { calendlyInviteeUri: inviteeUri },
      });
    }
    if (!session && eventUri) {
      session = await this.prisma.personalMentorshipSession.findFirst({
        where: { calendlyEventUri: eventUri },
      });
    }

    if (!session && payload.tracking?.utm_term) {
      session = await this.prisma.personalMentorshipSession.findUnique({
        where: { id: payload.tracking.utm_term },
      });
    }

    if (session) {
      await this.prisma.personalMentorshipSession.update({
        where: { id: session.id },
        data: {
          status: "not_scheduled",
          scheduledAt: null,
          meetingUrl: null,
          calendlyEventUri: null,
          calendlyInviteeUri: null,
        },
      });
      return { status: "success", action: "cancelled", sessionId: session.id };
    }

    return { status: "unmatched", message: "No matching session found for cancellation" };
  }

  private verifyCalendlySignature(body: any, header: string, signingKey: string) {
    try {
      const parts = header.split(",").reduce((acc: any, part: string) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const timestamp = parts["t"];
      const signature = parts["v1"];

      if (!timestamp || !signature) {
        throw new BadRequestException("Invalid Calendly signature header");
      }

      const tolerance = 300000;
      const timeDiff = Math.abs(Date.now() - Number(timestamp) * 1000);
      if (timeDiff > tolerance) {
        throw new BadRequestException("Calendly signature timestamp expired");
      }

      const payloadString = typeof body === "string" ? body : JSON.stringify(body);
      const dataToSign = `${timestamp}.${payloadString}`;
      const expectedSignature = crypto
        .createHmac("sha256", signingKey)
        .update(dataToSign)
        .digest("hex");

      if (signature !== expectedSignature) {
        throw new BadRequestException("Calendly webhook signature verification failed");
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "production") {
        throw new BadRequestException(err?.message || "Calendly signature verification failed");
      }
      console.warn("Calendly signature verification bypassed in non-production:", err?.message);
    }
  }

}
