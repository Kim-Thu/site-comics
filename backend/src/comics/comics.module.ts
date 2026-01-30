import { Module } from '@nestjs/common';
import { ComicsService } from './application/comics.service';
import { IComicRepository } from './domain/comic-repository.interface';
import { ComicsController } from './infrastructure/controllers/comics.controller';
import { PrismaComicRepository } from './infrastructure/persistence/prisma-comic.repository';

@Module({
  controllers: [ComicsController],
  providers: [
    ComicsService,
    {
      provide: IComicRepository,
      useClass: PrismaComicRepository,
    },
  ],
  exports: [ComicsService],
})
export class ComicsModule {}
