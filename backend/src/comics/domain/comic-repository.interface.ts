import { CreateComicDto, UpdateComicDto } from '../infrastructure/dtos/comic.dto';
import { Comic } from './entities/comic';

export interface IComicRepository {
  findAll(query?: string): Promise<Comic[]>;
  findOne(slug: string): Promise<Comic | null>;
  findById(id: string): Promise<Comic | null>;
  getLatest(limit: number): Promise<Comic[]>;
  create(data: CreateComicDto): Promise<Comic>;
  update(id: string, data: UpdateComicDto): Promise<Comic>;
  delete(id: string): Promise<Comic>;
}

export const IComicRepository = Symbol('IComicRepository');
