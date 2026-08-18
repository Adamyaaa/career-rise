import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMentorshipApplicationDto } from "./dto/create-application.dto";

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
}
