import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { AdminService } from "./admin.service";
import {
  AssignMentorDto,
  CreateCohortDto,
  CreateCourseDto,
  CreateUserDto,
  UpdateCohortDto,
  UpdateCourseDto,
  UpdateUserDto,
} from "./dto/admin.dto";

// Every route here is SUPER_ADMIN only — the role sits above MENTOR, which is scoped to
// its own assigned cohorts.
@Controller("admin")
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post("users")
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch("users/:id")
  updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.updateUser(user, id, dto);
  }

  @Delete("users/:id")
  deleteUser(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.deleteUser(user, id);
  }

  @Get("courses")
  listCourses() {
    return this.adminService.listCourses();
  }

  @Post("courses")
  createCourse(@Body() dto: CreateCourseDto) {
    return this.adminService.createCourse(dto);
  }

  @Patch("courses/:id")
  updateCourse(@Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.adminService.updateCourse(id, dto);
  }

  @Delete("courses/:id")
  deleteCourse(@Param("id") id: string) {
    return this.adminService.deleteCourse(id);
  }

  @Get("cohorts")
  listCohorts() {
    return this.adminService.listCohorts();
  }

  @Post("cohorts")
  createCohort(@Body() dto: CreateCohortDto) {
    return this.adminService.createCohort(dto);
  }

  @Patch("cohorts/:id")
  updateCohort(@Param("id") id: string, @Body() dto: UpdateCohortDto) {
    return this.adminService.updateCohort(id, dto);
  }

  @Delete("cohorts/:id")
  deleteCohort(@Param("id") id: string) {
    return this.adminService.deleteCohort(id);
  }

  @Post("cohorts/:id/mentors")
  assignMentor(@Param("id") id: string, @Body() dto: AssignMentorDto) {
    return this.adminService.assignMentor(id, dto);
  }

  @Delete("cohorts/:id/mentors/:mentorUserId")
  unassignMentor(@Param("id") id: string, @Param("mentorUserId") mentorUserId: string) {
    return this.adminService.unassignMentor(id, mentorUserId);
  }
}
