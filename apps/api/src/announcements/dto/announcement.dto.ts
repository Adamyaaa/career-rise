import { IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  // Optional. An empty string clears it, so the validator only runs on real values.
  @IsOptional()
  @ValidateIf((_, value) => value !== "")
  @IsUrl({ require_protocol: true }, { message: "link must be a full URL, e.g. https://…" })
  @MaxLength(2048)
  link?: string;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== "")
  @IsUrl({ require_protocol: true }, { message: "link must be a full URL, e.g. https://…" })
  @MaxLength(2048)
  link?: string;
}
