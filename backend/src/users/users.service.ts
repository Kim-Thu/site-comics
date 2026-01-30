import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { userRole: true }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password && typeof data.password === 'string') {
        data.password = await bcrypt.hash(data.password, 10);
    }
    
    // If updating status, log it? Maybe controller handles logging
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const [users, total] = await Promise.all([
        this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: { 
                activityLogs: { take: 5, orderBy: { createdAt: 'desc' }},
                userRole: true
            } // Include recent logs and role
        }),
        this.prisma.user.count({ where })
    ]);
    return { data: users, total };
  }

  async changeStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
      return this.prisma.user.update({
          where: { id },
          data: { status: status as any } // Cast to any if enum not generated yet
      });
  }

  async logActivity(userId: string, action: string, details?: string, ipAddress?: string) {
      // Check if model exists on prisma (runtime check via try/catch not needed if schema updated)
      // Use any cast to avoid TS errors if generation failed
      return (this.prisma as any).activityLog.create({
          data: { userId, action, details, ipAddress }
      });
  }
}
