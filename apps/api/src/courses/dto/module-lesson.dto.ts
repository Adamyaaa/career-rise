import { IsBoolean, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateModuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  // Empty string clears the date; omitted leaves it untouched.
  @IsOptional()
  @IsISO8601()
  scheduledFor?: string;
}

export class UpdateModuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  scheduledFor?: string;
}

export class CreateLessonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}

export class UpdateLessonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}

export class SetLessonTaughtDto {
  @IsBoolean()
  taught: boolean;
}
