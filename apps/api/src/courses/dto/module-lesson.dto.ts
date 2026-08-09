import { IsBoolean, IsString, MaxLength, MinLength } from "class-validator";

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
