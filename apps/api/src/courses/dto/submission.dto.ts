import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

// Link-only, deliberately: file uploads wrote to the API container's own disk and were
// lost on every redeploy, which is why announcements dropped them too. A student submits
// a URL to the work (repo, doc, deployed app) rather than a file.
export class CreateSubmissionDto {
  @IsString()
  @MinLength(1)
  lessonId: string;

  @IsUrl({ require_protocol: true }, { message: "Enter a full link starting with http:// or https://" })
  @MaxLength(2000)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
