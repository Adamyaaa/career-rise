import { IsString, IsOptional, IsInt } from "class-validator";

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  driveFolderUrl?: string;

  @IsString()
  @IsOptional()
  iconName?: string;

  @IsOptional()
  colorScheme?: any;

  @IsInt()
  @IsOptional()
  order?: number;
}
