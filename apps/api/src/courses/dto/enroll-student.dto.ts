import { IsEmail } from "class-validator";

export class EnrollStudentDto {
  @IsEmail()
  email: string;
}
