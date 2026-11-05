import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MatchStudentDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  seniorMentorId: string;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsString()
  targetCompany?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ReassignMentorDto {
  @IsOptional()
  @IsString()
  seniorMentorId?: string | null;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsString()
  targetCompany?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
