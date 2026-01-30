import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search = '') {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }
    
    return this.usersService.findAll({ skip, take, where, orderBy: { createdAt: 'desc' } });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'BANNED', @Req() req: any) {
      await this.usersService.logActivity(id, 'STATUS_CHANGE', `Changed status to ${status} by admin ${req.user.userId}`);
      return this.usersService.changeStatus(id, status);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() body: any, @Req() req: any) {
      await this.usersService.logActivity(id, 'ROLE_CHANGE', `Changed role to ${body.role || body.roleId} by admin ${req.user.userId}`);
      return this.usersService.update(id, body);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string, @Req() req: any) {
       await this.usersService.logActivity(id, 'PASSWORD_RESET', `Password reset by admin ${req.user.userId}`);
       return this.usersService.update(id, { password: newPassword });
  }
}
