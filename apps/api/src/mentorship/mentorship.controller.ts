import { Controller, Post, Get, Body } from "@nestjs/common";
import { MentorshipService } from "./mentorship.service";
import { CreateMentorshipApplicationDto } from "./dto/create-application.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("mentorship")
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Public()
  @Post("applications")
  async createApplication(@Body() body: CreateMentorshipApplicationDto) {
    return this.mentorshipService.createApplication(body);
  }

  @Roles("SUPER_ADMIN", "MENTOR")
  @Get("applications")
  async listApplications() {
    return this.mentorshipService.listApplications();
  }
}
