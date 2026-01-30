import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createForUser(userId: string, title: string, message: string, link?: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link,
      },
    });
  }

  async createForUsers(userIds: string[], title: string, message: string, link?: string) {
    // MongoDB createMany is supported in newer Prisma versions, or map promise.all
    // Using createMany for efficiency if possible, but relation fields sometimes tricky.
    // simpler to loop for now to be safe with all drivers/versions in this context
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      link
    }));
    
    return this.prisma.notification.createMany({
        data: notifications
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
  }
}
