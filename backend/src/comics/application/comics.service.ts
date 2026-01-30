import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IComicRepository } from '../domain/comic-repository.interface';
import { Comic } from '../domain/entities/comic';
import { CreateComicDto, UpdateComicDto } from '../infrastructure/dtos/comic.dto';

@Injectable()
export class ComicsService {
  constructor(
    @Inject(IComicRepository)
    private readonly comicRepository: IComicRepository
  ) {}

  async findAll(query?: string): Promise<Comic[]> {
    return this.comicRepository.findAll(query);
  }

  async findOne(slug: string): Promise<Comic | null> {
    return this.comicRepository.findOne(slug);
  }

  async findById(id: string): Promise<Comic | null> {
    return this.comicRepository.findById(id);
  }

  async getLatest(): Promise<Comic[]> {
    return this.comicRepository.getLatest(12);
  }

  async create(data: CreateComicDto, user?: any): Promise<Comic> {
    const comicData = { ...data, creatorId: user?.userId };
    return this.comicRepository.create(comicData);
  }

  async update(id: string, data: UpdateComicDto, user?: any): Promise<Comic> {
    const comic = await this.findById(id);
    if (!comic) throw new NotFoundException('Comic not found');

    if (user && user.role !== 'ADMIN') {
        if (comic.creatorId && comic.creatorId !== user.userId) {
             throw new ForbiddenException('Bạn không có quyền chỉnh sửa truyện này');
        }
    }
    return this.comicRepository.update(id, data);
  }

  async delete(id: string, user?: any): Promise<Comic> {
     const comic = await this.findById(id);
     if (!comic) throw new NotFoundException('Comic not found');

    if (user && user.role !== 'ADMIN') {
        if (comic.creatorId && comic.creatorId !== user.userId) {
             throw new ForbiddenException('Bạn không có quyền xóa truyện này');
        }
    }
    return this.comicRepository.delete(id);
  }
}
