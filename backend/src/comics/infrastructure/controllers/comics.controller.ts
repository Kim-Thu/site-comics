import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ComicsService } from '../../application/comics.service';
import { CreateComicDto, UpdateComicDto } from '../dtos/comic.dto';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Get()
  findAll(@Query('q') query?: string) {
    return this.comicsService.findAll(query);
  }

  @Get('latest')
  getLatest() {
    return this.comicsService.getLatest();
  }

  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.comicsService.findById(id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.comicsService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createComicDto: CreateComicDto, @Req() req: any) {
    return this.comicsService.create(createComicDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto, @Req() req: any) {
    return this.comicsService.update(id, updateComicDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.comicsService.delete(id, req.user);
  }
}
