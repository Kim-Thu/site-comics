import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChaptersService } from './chapters.service';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get('comic/:comicId')
  findByComic(@Param('comicId') comicId: string) {
    return this.chaptersService.findByComic(comicId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() data: any, @Req() req: any) {
    // userId is in req.user.userId
    return this.chaptersService.create(data, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.chaptersService.update(id, data, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.chaptersService.remove(id, req.user);
  }
}
