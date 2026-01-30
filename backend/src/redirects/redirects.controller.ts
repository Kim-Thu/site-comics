import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('redirects')
export class RedirectsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('search') search: string) {
    const where = search ? {
      OR: [
        { fromPath: { contains: search, mode: 'insensitive' } },
        { toPath: { contains: search, mode: 'insensitive' } },
      ],
    } : {};
    
    return this.prisma.redirect.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() data: any) {
    return this.prisma.redirect.create({ data });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.redirect.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.redirect.delete({ where: { id } });
  }
}
