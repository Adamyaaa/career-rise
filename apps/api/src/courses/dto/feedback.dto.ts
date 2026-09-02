import { IsObject } from "class-validator";

export class PostFeedbackDto {
  @IsObject()
  responses: Record<string, string>;
}
