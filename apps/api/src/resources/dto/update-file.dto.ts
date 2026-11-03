import { IsString, IsOptional, IsArray, IsBoolean, IsInt } from "class-validator";

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  driveUrl?: string;

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

  @IsString()
  @IsOptional()
  folderId?: string;
}
