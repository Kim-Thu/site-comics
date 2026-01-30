import { Injectable } from '@nestjs/common';
import { removeAccents } from '../../../common/utils';
import { PrismaService } from '../../../prisma/prisma.service';
import { IComicRepository } from '../../domain/comic-repository.interface';
import { Comic } from '../../domain/entities/comic';
import { CreateComicDto, UpdateComicDto } from '../dtos/comic.dto';

@Injectable()
export class PrismaComicRepository implements IComicRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string): Promise<Comic[]> {
    let whereClause = {};

    if (query) {
      const normalizedQuery = removeAccents(query);
      whereClause = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { searchTitle: { contains: normalizedQuery, mode: 'insensitive' } }, // Search against optional normalized field
          { author: { contains: query, mode: 'insensitive' } },
        ],
      };
    }

    const comics = await this.prisma.comic.findMany({
      where: whereClause,
      include: {
        categories: true,
        tags: true,
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return comics as unknown as Comic[]; 
  }

  async findOne(slug: string): Promise<Comic | null> {
    const comic = await this.prisma.comic.findUnique({
      where: { slug },
      include: {
        categories: true,
        tags: true,
        chapters: {
          orderBy: { number: 'desc' },
        },
      },
    });
    return comic as unknown as Comic;
  }

  async findById(id: string): Promise<Comic | null> {
    const comic = await this.prisma.comic.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
      },
    });
    return comic as unknown as Comic;
  }

  async getLatest(limit: number): Promise<Comic[]> {
    const comics = await this.prisma.comic.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
        },
        tags: true,
      },
    });
    return comics as unknown as Comic[];
  }

  async create(data: CreateComicDto): Promise<Comic> {
    const { categoryIds, tagIds, ...rest } = data;
    const searchTitle = removeAccents(rest.title); // Normalize title for search
    
    const comic = await this.prisma.comic.create({
      data: {
        ...rest,
        searchTitle,
        // Prisma MongoDB relation handling
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined,
        tags: tagIds ? {
          connect: tagIds.map(id => ({ id }))
        } : undefined
      },
      include: { categories: true, tags: true }
    });
    return comic as unknown as Comic;
  }

  async update(id: string, data: UpdateComicDto): Promise<Comic> {
    const { categoryIds, tagIds, ...rest } = data;
    const updateData: any = { ...rest };

    if (rest.title) {
      updateData.searchTitle = removeAccents(rest.title);
    }

    if (categoryIds) {
      updateData.categories = {
        set: categoryIds.map((cid: string) => ({ id: cid })),
      };
    }

    if (tagIds) {
      updateData.tags = {
        set: tagIds.map((tid: string) => ({ id: tid })),
      };
    }

    const comic = await this.prisma.comic.update({
      where: { id },
      data: updateData,
      include: { categories: true, tags: true },
    });
    return comic as unknown as Comic;
  }

  async delete(id: string): Promise<Comic> {
    const comic = await this.prisma.comic.delete({
      where: { id },
    });
    return comic as unknown as Comic;
  }
}
