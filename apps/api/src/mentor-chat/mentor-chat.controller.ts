import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from "@nestjs/common";
import { MentorChatService } from "./mentor-chat.service";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateThreadStatusDto } from "./dto/update-thread-status.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("mentor-chat")
export class MentorChatController {
  constructor(private readonly mentorChatService: MentorChatService) {}

  @Roles("STUDENT")
  @Get("mentor")
  async getStudentMentor(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorChatService.getStudentMentor(user.id);
  }

  @Get("threads")
  async getThreads(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorChatService.getThreads(user);
  }

  @Roles("STUDENT")
  @Post("threads")
  async createThread(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateThreadDto,
  ) {
    return this.mentorChatService.createThread(user, body);
  }

  @Get("threads/:id")
  async getThreadById(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mentorChatService.getThreadById(id, user);
  }

  @Post("threads/:id/messages")
  async addMessage(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateMessageDto,
  ) {
    return this.mentorChatService.addMessage(id, user, body);
  }

  @Patch("threads/:id/status")
  async updateThreadStatus(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateThreadStatusDto,
  ) {
    return this.mentorChatService.updateThreadStatus(id, user, body.status);
  }
}
