import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ComicsModule } from './comics/comics.module';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { ChaptersModule } from './chapters/chapters.module';
import { TagsModule } from './tags/tags.module';

import { MediaModule } from './media/media.module';
import { MenusModule } from './menus/menus.module';
import { RolesModule } from './roles/roles.module';

import { LayoutController } from './layout/layout.controller';
import { PagesController } from './pages/pages.controller';
import { RedirectsController } from './redirects/redirects.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule, 
    ComicsModule, 
    CommonModule,
    AuthModule,
    UsersModule,
    RolesModule,
    NotificationsModule,
    SettingsModule,
    CategoriesModule,
    ChaptersModule,
    TagsModule,
    MediaModule,
    MenusModule
  ],
  controllers: [
    AppController, 
    PagesController, 
    RedirectsController, 
    LayoutController
  ],
  providers: [AppService],
})
export class AppModule {}
