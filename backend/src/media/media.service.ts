import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(file: Express.Multer.File, userId: string) {
    const url = process.env.API_URL 
      ? `${process.env.API_URL}/uploads/${file.filename}` 
      : `http://localhost:3001/uploads/${file.filename}`;

    return this.prisma.media.create({
      data: {
        url,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        userId: userId,
        caption: file.originalname,
      } as any,
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
       where.OR = [
         { filename: { contains: search, mode: 'insensitive' } },
         { caption: { contains: search, mode: 'insensitive' } },
         { alt: { contains: search, mode: 'insensitive' } },
       ];
    }

    const [files, total] = await Promise.all([
        this.prisma.media.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } },
        } as any),
        this.prisma.media.count({ where } as any)
    ]);

    return {
        data: files,
        meta: {
            total,
            page: Number(page),
            last_page: Math.ceil(total / limit)
        }
    };
  }

  async update(id: string, data: any) {
       return this.prisma.media.update({
          where: { id },
          data
      } as any);
  }

  async remove(id: string) {
      return this.prisma.media.delete({ where: { id } } as any);
  }
}
