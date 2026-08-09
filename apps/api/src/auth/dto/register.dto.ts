import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  // Loose on purpose — international formats vary, so this only rejects obvious junk.
  @IsOptional()
  @IsString()
  @Matches(/^[+()\d\s-]{6,20}$/, { message: "phone must be a valid phone number" })
  phone?: string;
}
