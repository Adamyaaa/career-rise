import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateModuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}

export class UpdateModuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}

export class CreateLessonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  // Empty string clears the date; omitted leaves it untouched.
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

export class UpdateLessonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  // What the class covers, shown to students on the class page. "" clears it.
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  // Whether this class expects work to be handed in.
  @IsOptional()
  @IsBoolean()
  submissionRequired?: boolean;
}

export class SetLessonCancelledDto {
  @IsBoolean()
  cancelled: boolean;
}
