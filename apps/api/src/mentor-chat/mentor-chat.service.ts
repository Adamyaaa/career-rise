import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Injectable()
export class MentorChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Discovers the student's primary mentor (from 1:1 Pro track or enrolled cohorts)
   */
  async getStudentMentor(studentId: string) {
    // 1. Check 1:1 Pro Mentorship Track
    const proTrack = await this.prisma.proMentorshipTrack.findUnique({
      where: { studentId },
      include: {
        seniorMentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mentorProfile: {
              select: {
                specializations: true,
                calendlyUrl: true,
              },
            },
          },
        },
      },
    });

    if (proTrack?.seniorMentor) {
      return {
        mentor: proTrack.seniorMentor,
        source: "pro_track",
        trackTitle: proTrack.targetRole || "1:1 Mentorship Sprint",
      };
    }

    // 2. Check Cohort Enrollments
    const enrollment = await this.prisma.cohortEnrollment.findFirst({
      where: { studentId, status: "active" },
      include: {
        cohort: {
          include: {
            mentorAssignments: {
              include: {
                mentorProfile: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        mentorProfile: {
                          select: {
                            specializations: true,
                            calendlyUrl: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const cohortMentor =
      enrollment?.cohort?.mentorAssignments?.[0]?.mentorProfile?.user;
    if (cohortMentor) {
      return {
        mentor: cohortMentor,
        source: "cohort",
        cohortName: enrollment.cohort.name,
      };
    }

    // 3. Fallback: Any active mentor in the system
    const defaultMentor = await this.prisma.user.findFirst({
      where: { role: "MENTOR", isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mentorProfile: {
          select: {
            specializations: true,
            calendlyUrl: true,
          },
        },
      },
    });

    return {
      mentor: defaultMentor,
      source: "general",
    };
  }

  async getThreads(user: AuthenticatedUser) {
    if (user.role === "STUDENT") {
      return this.prisma.mentorChatThread.findMany({
        where: { studentId: user.id },
        include: {
          mentor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, content: true, senderId: true, createdAt: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // Mentor / Admin view
    return this.prisma.mentorChatThread.findMany({
      where:
        user.role === "SUPER_ADMIN"
          ? {}
          : {
              OR: [{ mentorId: user.id }, { mentorId: null }],
            },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        mentor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, senderId: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getThreadById(threadId: string, user: AuthenticatedUser) {
    const thread = await this.prisma.mentorChatThread.findUnique({
      where: { id: threadId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        mentor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cohort: {
          select: { id: true, name: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException("Doubt thread not found");
    }

    if (
      user.role === "STUDENT" &&
      thread.studentId !== user.id
    ) {
      throw new ForbiddenException("You cannot view this doubt thread");
    }

    return thread;
  }

  async createThread(user: AuthenticatedUser, dto: CreateThreadDto) {
    let mentorId = dto.mentorId || null;

    if (!mentorId) {
      const mentorInfo = await this.getStudentMentor(user.id);
      mentorId = mentorInfo.mentor?.id || null;
    }

    const title =
      dto.title?.trim() ||
      dto.initialMessage.slice(0, 48) + (dto.initialMessage.length > 48 ? "..." : "");

    return this.prisma.$transaction(async (tx) => {
      const thread = await tx.mentorChatThread.create({
        data: {
          studentId: user.id,
          mentorId,
          cohortId: dto.cohortId || null,
          title,
          status: "open",
        },
      });

      await tx.mentorChatMessage.create({
        data: {
          threadId: thread.id,
          senderId: user.id,
          content: dto.initialMessage.trim(),
        },
      });

      return tx.mentorChatThread.findUnique({
        where: { id: thread.id },
        include: {
          mentor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          messages: {
            include: {
              sender: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
              },
            },
          },
        },
      });
    });
  }

  async addMessage(
    threadId: string,
    user: AuthenticatedUser,
    dto: CreateMessageDto,
  ) {
    const thread = await this.prisma.mentorChatThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException("Thread not found");
    }

    if (user.role === "STUDENT" && thread.studentId !== user.id) {
      throw new ForbiddenException("You cannot post in this thread");
    }

    return this.prisma.$transaction(async (tx) => {
      // If mentor replies and thread had no assigned mentor, claim it
      const updateData: any = { updatedAt: new Date() };
      if (user.role !== "STUDENT" && !thread.mentorId) {
        updateData.mentorId = user.id;
      }
      // Reopen thread if student posts in resolved thread
      if (user.role === "STUDENT" && thread.status === "resolved") {
        updateData.status = "open";
      }

      await tx.mentorChatThread.update({
        where: { id: threadId },
        data: updateData,
      });

      return tx.mentorChatMessage.create({
        data: {
          threadId,
          senderId: user.id,
          content: dto.content.trim(),
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      });
    });
  }

  async updateThreadStatus(
    threadId: string,
    user: AuthenticatedUser,
    status: "open" | "resolved",
  ) {
    const thread = await this.prisma.mentorChatThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException("Thread not found");
    }

    if (
      user.role === "STUDENT" &&
      thread.studentId !== user.id
    ) {
      throw new ForbiddenException("You cannot update this thread");
    }

    return this.prisma.mentorChatThread.update({
      where: { id: threadId },
      data: { status },
      include: {
        mentor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
