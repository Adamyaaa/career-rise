import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CoursesService } from "./courses.service";

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get("cohorts")
  listCohorts() {
    return this.coursesService.listCohorts();
  }

  @Get("cohorts/my")
  @Roles(Role.STUDENT, Role.MENTOR)
  listMyCohorts(@CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listMyCohorts(user);
  }

  @Get("cohorts/:id/modules")
  listModules(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listModulesWithLessons(id, user);
  }

  @Post("lessons/:id/complete")
  @Roles(Role.STUDENT)
  markComplete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.setLessonComplete(user, id, true);
  }

  @Delete("lessons/:id/complete")
  @Roles(Role.STUDENT)
  markIncomplete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.setLessonComplete(user, id, false);
  }
}
