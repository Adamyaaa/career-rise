import { IsString, IsOptional, IsArray, IsBoolean, IsInt } from "class-validator";

export class CreateFileDto {
  @IsString()
  title: string;

  @IsString()
  driveUrl: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isHandwritten?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
