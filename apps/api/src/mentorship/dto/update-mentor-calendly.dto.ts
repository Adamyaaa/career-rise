import { IsString, IsUrl } from "class-validator";

export class UpdateMentorCalendlyDto {
  @IsString()
  calendlyUrl: string;
}
