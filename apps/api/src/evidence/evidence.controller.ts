import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { EvidenceService } from "./evidence.service";
import { CreateEvidenceDto } from "./dto/create-evidence.dto";

@Controller("evidence")
@Roles(Role.STUDENT)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEvidenceDto) {
    return this.evidenceService.submit(user.id, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthenticatedUser, @Query("cohortId") cohortId: string) {
    return this.evidenceService.listMine(user.id, cohortId);
  }
}
