import { IsOptional, IsString, IsInt, IsArray, IsDateString } from "class-validator";

export class UpdateMentorshipSessionDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  durationMins?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @IsOptional()
  deliverables?: any;

  @IsOptional()
  @IsString()
  mentorFeedback?: string;

  @IsOptional()
  actionItems?: any;

  @IsOptional()
  @IsString()
  studentNotes?: string;
}
