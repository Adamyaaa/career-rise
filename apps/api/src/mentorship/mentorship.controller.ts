import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Headers,
} from "@nestjs/common";
import { MentorshipService } from "./mentorship.service";
import { CreateMentorshipApplicationDto } from "./dto/create-application.dto";
import { ApproveMentorshipApplicationDto } from "./dto/approve-application.dto";
import { UpdateMentorshipSessionDto } from "./dto/update-session.dto";
import { UpdateMentorCalendlyDto } from "./dto/update-mentor-calendly.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

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

  @Roles("SUPER_ADMIN")
  @Post("applications/:id/approve")
  async approveApplication(
    @Param("id") id: string,
    @Body() body: ApproveMentorshipApplicationDto,
  ) {
    return this.mentorshipService.approveApplication(id, body);
  }

  @Roles("SUPER_ADMIN")
  @Post("applications/:id/reject")
  async rejectApplication(@Param("id") id: string) {
    return this.mentorshipService.rejectApplication(id);
  }

  // Student Pro Track Access Gate
  @Get("pro/my-track")
  async getMyTrack(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorshipService.getMyTrack(user);
  }

  @Get("pro/tracks/:id")
  async getTrackById(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mentorshipService.getTrackById(id, user);
  }

  @Roles("SUPER_ADMIN")
  @Get("pro/all-tracks")
  async listAllTracks() {
    return this.mentorshipService.listAllTracks();
  }

  @Roles("MENTOR", "SUPER_ADMIN")
  @Get("pro/mentor-tracks")
  async listMentorTracks(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorshipService.listMentorTracks(user.id);
  }

  @Get("pro/sessions/:sessionId")
  async getSessionById(
    @Param("sessionId") sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mentorshipService.getSessionById(sessionId, user);
  }

  @Patch("pro/sessions/:sessionId")
  async updateSession(
    @Param("sessionId") sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateMentorshipSessionDto,
  ) {
    return this.mentorshipService.updateSession(sessionId, user, body);
  }

  // Calendly Webhook & Mentor Setup
  @Public()
  @Post("calendly/webhook")
  async calendlyWebhook(
    @Body() body: any,
    @Headers("calendly-webhook-signature") signature?: string,
  ) {
    return this.mentorshipService.handleCalendlyWebhook(body, signature);
  }

  @Roles("MENTOR", "SUPER_ADMIN")
  @Get("mentor/calendly-url")
  async getMentorCalendlyUrl(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorshipService.getMentorCalendlyUrl(user.id);
  }

  @Roles("MENTOR", "SUPER_ADMIN")
  @Patch("mentor/calendly-url")
  async updateMentorCalendlyUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateMentorCalendlyDto,
  ) {
    return this.mentorshipService.updateMentorCalendlyUrl(user.id, body.calendlyUrl);
  }
}
