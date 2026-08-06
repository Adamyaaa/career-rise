import { Module } from "@nestjs/common";
import { SharedFilesController } from "./shared-files.controller";
import { SharedFilesService } from "./shared-files.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SharedFilesController],
  providers: [SharedFilesService],
})
export class SharedFilesModule {}
