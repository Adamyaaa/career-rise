import { IsArray, IsOptional, ValidateNested, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class SlideLinkDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(2048)
  url: string;
}

export class UpdateLessonSlidesDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideLinkDto)
  slides?: SlideLinkDto[];
}
