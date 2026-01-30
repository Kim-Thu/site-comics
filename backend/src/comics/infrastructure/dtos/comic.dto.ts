import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export enum ComicStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
}

export class CreateComicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUrl()
  thumbnail: string;

  @IsUrl()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsString()
  @IsOptional()
  creatorId?: string;
}

export class UpdateComicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  views?: number;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  tagIds?: string[];
}
