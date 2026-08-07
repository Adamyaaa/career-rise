import { Controller, Get, Param } from "@nestjs/common";
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
  @Roles(Role.STUDENT)
  listMyCohorts(@CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listMyCohorts(user.id);
  }

  @Get("cohorts/:id/modules")
  listModules(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listModulesWithLessons(id, user);
  }
}
