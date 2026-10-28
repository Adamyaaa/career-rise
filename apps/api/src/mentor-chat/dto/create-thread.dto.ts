import { IsString, IsOptional } from "class-validator";

export class CreateThreadDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  initialMessage: string;

  @IsString()
  @IsOptional()
  cohortId?: string;

  @IsString()
  @IsOptional()
  mentorId?: string;
}
