import { IsString, IsUrl } from "class-validator";

export class CreateEvidenceDto {
  @IsString()
  lessonId: string;

  @IsUrl()
  externalUrl: string;
}
