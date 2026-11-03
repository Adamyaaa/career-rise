import { IsOptional, IsString, IsArray } from "class-validator";

export class UpdateMentorSettingsDto {
  @IsOptional()
  @IsString()
  googleMeetUrl?: string;

  @IsOptional()
  @IsArray()
  availableSlots?: string[];

  @IsOptional()
  @IsString()
  calendlyUrl?: string;
}
