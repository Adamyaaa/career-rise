import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { EvidenceController } from "./evidence.controller";
import { EvidenceService } from "./evidence.service";

@Module({
  imports: [PrismaModule],
  controllers: [EvidenceController],
  providers: [EvidenceService],
})
export class EvidenceModule {}
