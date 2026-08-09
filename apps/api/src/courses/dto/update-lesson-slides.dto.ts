import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateLessonSlidesDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  slidesUrl?: string;
}
