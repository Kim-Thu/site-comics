import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Cast to any if generic client not updated
    return (this.prisma as any).role.findMany({
        include: { _count: { select: { users: true } } }
    });
  }

  async findOne(id: string) {
    return (this.prisma as any).role.findUnique({
      where: { id },
      include: { users: true }
    });
  }

  async create(data: { name: string; description?: string; permissions: string[] }) {
    return (this.prisma as any).role.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return (this.prisma as any).role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return (this.prisma as any).role.delete({
      where: { id },
    });
  }
}
