import { IsOptional, IsString } from "class-validator";

export class ApproveMentorshipApplicationDto {
  @IsOptional()
  @IsString()
  seniorMentorId?: string;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsString()
  targetCompany?: string;
}
