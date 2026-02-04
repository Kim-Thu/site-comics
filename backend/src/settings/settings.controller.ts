import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  updateSettings(@Body() data: any) {
    return this.settingsService.updateSettings(data);
  }

  @Get('seo')
  getSeoSettings() {
    return this.settingsService.getSeoSettings();
  }

  @Patch('seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  updateSeoSettings(@Body() data: any) {
    return this.settingsService.updateSeoSettings(data);
  }

  @Post('seo/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  resetSeo() {
    return this.settingsService.resetAllIndividualSeo();
  }
}
