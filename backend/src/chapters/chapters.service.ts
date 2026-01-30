import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async findByComic(comicId: string) {
    return this.prisma.chapter.findMany({
      where: { comicId },
      orderBy: { number: 'desc' },
    });
  }

  async create(data: any, user: any) {
    const comic = await this.prisma.comic.findUnique({ where: { id: data.comicId } }) as any;
    if (!comic) throw new NotFoundException('Comic not found');

    if (user.role !== 'ADMIN' && comic.creatorId && comic.creatorId !== user.userId) {
       throw new ForbiddenException('Bạn không có quyền thêm chương cho truyện này');
    }
    
    return this.prisma.chapter.create({
      data,
    });
  }

  async update(id: string, data: any, user: any) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { comic: true } }) as any;
    if (!chapter) throw new NotFoundException('Chapter not found');
    
    if (user.role !== 'ADMIN' && chapter.comic.creatorId && chapter.comic.creatorId !== user.userId) {
        throw new ForbiddenException('Bạn không có quyền sửa chương này');
    }

    return this.prisma.chapter.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, user: any) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { comic: true } }) as any;
    if (!chapter) throw new NotFoundException('Chapter not found');

    if (user.role !== 'ADMIN' && chapter.comic.creatorId && chapter.comic.creatorId !== user.userId) {
        throw new ForbiddenException('Bạn không có quyền xóa chương này');
    }

    return this.prisma.chapter.delete({
      where: { id },
    });
  }
}
