import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: any) {
      return this.notificationsService.markAllAsRead(req.user.userId);
  }

  // DEMO ONLY: Trigger a notification for the current user
  @Get('test-trigger')
  async triggerTest(@Request() req: any) {
    return this.notificationsService.createForUser(
      req.user.userId,
      'Chương mới: Shadow Blade',
      'Shadow Blade: Eternal Night vừa cập nhật Chapter 15 mới nhất!',
      '/comic/shadow-blade-eternal-night/chapter-15'
    );
  }
}
