import { IsOptional, IsString } from "class-validator";

export class UploadFileDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  cohortId?: string;

  @IsString()
  @IsOptional()
  lessonId?: string;
}
