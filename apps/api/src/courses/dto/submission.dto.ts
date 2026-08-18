import { IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

// Work submission expecting a project name, summary, and links to drive/github.
export class CreateSubmissionDto {
  @IsString()
  @MinLength(1)
  lessonId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  projectName: string;

  @ValidateIf((o) => !o.githubUrl)
  @IsUrl({ require_protocol: true }, { message: "Enter a full link starting with http:// or https://" })
  @MaxLength(2000)
  driveUrl?: string;

  @ValidateIf((o) => !o.driveUrl)
  @IsUrl({ require_protocol: true }, { message: "Enter a full link starting with http:// or https://" })
  @MaxLength(2000)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  projectSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
