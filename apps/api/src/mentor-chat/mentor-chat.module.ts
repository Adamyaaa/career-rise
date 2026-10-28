import { Module } from "@nestjs/common";
import { MentorChatController } from "./mentor-chat.controller";
import { MentorChatService } from "./mentor-chat.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MentorChatController],
  providers: [MentorChatService],
  exports: [MentorChatService],
})
export class MentorChatModule {}
