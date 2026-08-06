import { Controller, Get, Param } from "@nestjs/common";
import { CoursesService } from "./courses.service";

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get("cohorts")
  listCohorts() {
    return this.coursesService.listCohorts();
  }

  @Get("cohorts/:id/modules")
  listModules(@Param("id") id: string) {
    return this.coursesService.listModulesWithLessons(id);
  }
}
