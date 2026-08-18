import { IsString, IsEmail, IsOptional } from "class-validator";

export class CreateMentorshipApplicationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  currentRole?: string;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsString()
  @IsOptional()
  timeline?: string;
}
