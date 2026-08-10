import { IsOptional, IsString } from "class-validator";

export class UpdateLessonAssignmentsDto {
  @IsString()
  @IsOptional()
  assignmentsUrl?: string;
}
