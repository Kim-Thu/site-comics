import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.tag.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
