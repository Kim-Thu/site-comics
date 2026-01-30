import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { UploadController } from './upload/upload.controller';

@Global()
@Module({
  providers: [CacheService],
  controllers: [UploadController],
  exports: [CacheService],
})
export class CommonModule {}
