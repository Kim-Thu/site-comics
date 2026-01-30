import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('pages')
export class PagesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('search') search: string) {
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    return this.prisma.page.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.page.findUnique({ where: { id } });
  }

  @Post()
  async create(@Body() data: any) {
    // Basic slug generation if missing
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    
    // Default author (first user found or from request if using auth)
    if (!data.authorId) {
      const user = await this.prisma.user.findFirst();
      data.authorId = user?.id;
    }

    return this.prisma.page.create({ data });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}
