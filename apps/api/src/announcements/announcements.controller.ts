import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { AnnouncementsService } from "./announcements.service";
import { CreateAnnouncementDto, UpdateAnnouncementDto } from "./dto/announcement.dto";

@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  // Any role — the service decides what this particular caller may see.
  @Get("cohorts/:id/announcements")
  list(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.announcementsService.list(user, id);
  }

  @Post("cohorts/:id/announcements")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  create(@Param("id") id: string, @Body() dto: CreateAnnouncementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.announcementsService.create(user, id, dto);
  }

  @Patch("announcements/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateAnnouncementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.announcementsService.update(user, id, dto);
  }

  @Delete("announcements/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.announcementsService.remove(user, id);
  }
}
