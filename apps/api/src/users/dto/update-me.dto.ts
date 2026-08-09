import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateMeDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  // Empty string clears the number; see RegisterDto for why the pattern is loose.
  @IsOptional()
  @IsString()
  @Matches(/^$|^[+()\d\s-]{6,20}$/, { message: "phone must be a valid phone number" })
  phone?: string;
}
