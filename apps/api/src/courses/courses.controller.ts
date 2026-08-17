import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CoursesService } from "./courses.service";
import { UpdateLessonSlidesDto } from "./dto/update-lesson-slides.dto";
import { UpdateLessonAssignmentsDto } from "./dto/update-lesson-assignments.dto";
import {
  CreateLessonDto,
  CreateModuleDto,
  SetLessonCancelledDto,
  UpdateLessonDto,
  UpdateModuleDto,
} from "./dto/module-lesson.dto";
import { EnrollStudentDto } from "./dto/enroll-student.dto";
import { PostFeedbackDto } from "./dto/feedback.dto";
import { CreateSubmissionDto } from "./dto/submission.dto";

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get("cohorts")
  listCohorts() {
    return this.coursesService.listCohorts();
  }

  @Get("cohorts/my")
  @Roles(Role.STUDENT, Role.MENTOR, Role.SUPER_ADMIN)
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

  @Patch("lessons/:id/slides")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  updateSlides(@Param("id") id: string, @Body() dto: UpdateLessonSlidesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.updateLessonSlidesUrl(user, id, dto.slidesUrl);
  }

  @Patch("lessons/:id/assignments")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  updateAssignments(@Param("id") id: string, @Body() dto: UpdateLessonAssignmentsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.updateLessonAssignmentsUrl(user, id, dto.assignmentsUrl);
  }

  @Patch("lessons/:id/cancelled")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  setCancelled(
    @Param("id") id: string,
    @Body() dto: SetLessonCancelledDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.setLessonCancelled(user, id, dto.cancelled);
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

  @Post("cohorts/:id/enroll-me")
  @Roles(Role.STUDENT)
  enrollSelf(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.enrollSelf(user, id);
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
  updateModule(@Param("id") id: string, @Body() dto: UpdateModuleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.updateModule(user, id, dto.title);
  }

  // Read is mentor/admin only — feedback is write-only from the student's side.
  @Get("cohorts/:id/feedback")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  listCohortFeedback(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listCohortFeedback(user, id);
  }

  @Post("lessons/:id/feedback")
  @Roles(Role.STUDENT)
  postFeedback(@Param("id") id: string, @Body() dto: PostFeedbackDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.postFeedback(user, id, dto.body);
  }

  @Get("cohorts/:id/progress")
  getCohortProgress(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.getCohortProgress(id, user);
  }

  // Students see their own submissions here; mentors and admins see the whole cohort's.
  @Get("cohorts/:id/submissions")
  listSubmissions(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.listSubmissions(user, id);
  }

  @Post("submissions")
  @Roles(Role.STUDENT)
  createSubmission(@Body() dto: CreateSubmissionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.createSubmission(user, dto.lessonId, dto.url, dto.note);
  }

  @Delete("submissions/:id")
  deleteSubmission(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteSubmission(user, id);
  }

  @Delete("feedback/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  deleteFeedback(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteFeedback(user, id);
  }

  @Delete("modules/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  deleteModule(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteModule(user, id);
  }

  @Post("modules/:id/lessons")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  createLesson(@Param("id") id: string, @Body() dto: CreateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.createLesson(user, id, dto.title, dto.scheduledAt);
  }

  @Patch("lessons/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  updateLesson(@Param("id") id: string, @Body() dto: UpdateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.updateLesson(
      user,
      id,
      dto.title,
      dto.scheduledAt,
      dto.content,
      dto.submissionRequired,
    );
  }

  @Delete("lessons/:id")
  @Roles(Role.MENTOR, Role.SUPER_ADMIN)
  deleteLesson(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.deleteLesson(user, id);
  }
}
