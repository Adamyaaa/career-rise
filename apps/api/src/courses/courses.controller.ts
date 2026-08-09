import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CoursesService } from "./courses.service";
import { UpdateLessonSlidesDto } from "./dto/update-lesson-slides.dto";
import {
  CreateLessonDto,
  CreateModuleDto,
  SetLessonTaughtDto,
  UpdateLessonDto,
  UpdateModuleDto,
} from "./dto/module-lesson.dto";
import { EnrollStudentDto } from "./dto/enroll-student.dto";

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

  // Declared after "cohorts/my" on purpose — ":id" would otherwise capture "my".
  @Get("cohorts/:id")
  getCohort(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.getCohortOverview(id, user);
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

  @Patch("lessons/:id/slides")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  updateSlides(@Param("id") id: string, @Body() dto: UpdateLessonSlidesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.updateLessonSlidesUrl(user, id, dto.slidesUrl);
  }

  @Patch("lessons/:id/taught")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  setTaught(@Param("id") id: string, @Body() dto: SetLessonTaughtDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.setLessonTaught(user, id, dto.taught);
  }

  @Get("cohorts/:id/students")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  listStudents(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listCohortStudents(user, id);
  }

  @Post("cohorts/:id/students")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  enrollStudent(@Param("id") id: string, @Body() dto: EnrollStudentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.enrollStudent(user, id, dto.email);
  }

  @Delete("cohorts/:id/students/:studentId")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  withdrawStudent(
    @Param("id") id: string,
    @Param("studentId") studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.withdrawStudent(user, id, studentId);
  }

  @Post("cohorts/:id/modules")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  createModule(@Param("id") id: string, @Body() dto: CreateModuleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.createModule(user, id, dto.title);
  }

  @Patch("modules/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  renameModule(@Param("id") id: string, @Body() dto: UpdateModuleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.renameModule(user, id, dto.title);
  }

  @Delete("modules/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  deleteModule(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteModule(user, id);
  }

  @Post("modules/:id/lessons")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  createLesson(@Param("id") id: string, @Body() dto: CreateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.createLesson(user, id, dto.title);
  }

  @Patch("lessons/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  renameLesson(@Param("id") id: string, @Body() dto: UpdateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.renameLesson(user, id, dto.title);
  }

  @Delete("lessons/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  deleteLesson(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteLesson(user, id);
  }
}
