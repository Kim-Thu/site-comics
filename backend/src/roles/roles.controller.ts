import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(@Body() data: { name: string; description?: string; permissions: string[] }) {
    return this.rolesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; description?: string; permissions?: string[] }) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
