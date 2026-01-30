import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('layout')
export class LayoutController {
  constructor(private prisma: PrismaService) {}

  @Get(':type')
  async findOne(@Param('type') type: string) {
    return this.prisma.layoutSection.findFirst({
      where: { type },
    });
  }

  @Patch(':type')
  async update(@Param('type') type: string, @Body() data: any) {
    const existing = await this.prisma.layoutSection.findFirst({
        where: { type }
    });

    if (existing) {
        return this.prisma.layoutSection.update({
            where: { id: existing.id },
            data: {
                structure: data.structure,
                name: data.name || type,
            }
        });
    }

    return this.prisma.layoutSection.create({
      data: {
        type,
        name: data.name || type,
        structure: data.structure,
        isActive: true,
      },
    });
  }
}
