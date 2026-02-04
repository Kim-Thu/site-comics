import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {
          siteName: 'TruyenMoi',
          facebookUrl: 'https://facebook.com/truyenmoi',
        },
      });
    }
    return settings;
  }

  async getSeoSettings() {
    let seo = await this.prisma.seoSettings.findFirst();
    if (!seo) {
      seo = await this.prisma.seoSettings.create({
        data: {
          homeTitle: 'TruyenMoi - Đọc Truyện Tranh Online',
          homeDescription: 'Website đọc truyện tranh online hàng đầu, cập nhật nhanh nhất các bộ truyện Manhwa, Manga, Manhua.',
          comicTitleTemplate: 'Đọc truyện %%title%% - %%author%% | TruyenMoi',
          comicDescTemplate: 'Đọc truyện %%title%% online mới nhất tại TruyenMoi. %%description%%',
          genreTitleTemplate: 'Truyện %%genre%% hay nhất | TruyenMoi',
          genreDescTemplate: 'Tuyển tập truyện thể loại %%genre%% cập nhật liên tục và nhanh nhất.',
          chapterTitleTemplate: '%%title%% - Chương %%chapter%% | TruyenMoi',
          globalKeywords: ['truyen tranh', 'doc truyen online', 'truyen moi', 'manhwa', 'manga'],
          ogImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1200',
        },
      });
    }
    return seo;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    const { id, ...updateData } = data; // Prevent updating 'id'
    return this.prisma.siteSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  async updateSeoSettings(data: any) {
    const seo = await this.getSeoSettings();
    const { id, ...updateData } = data;
    return this.prisma.seoSettings.update({
      where: { id: seo.id },
      data: updateData,
    });
  }

  async resetAllIndividualSeo() {
    await Promise.all([
      this.prisma.comic.updateMany({
        data: {
          metaTitle: null,
          metaDescription: null,
          focusKeyword: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          twitterTitle: null,
          twitterDescription: null,
          twitterImage: null,
        },
      }),
      this.prisma.page.updateMany({
        data: {
          metaTitle: null,
          metaDescription: null,
          focusKeyword: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          twitterTitle: null,
          twitterDescription: null,
          twitterImage: null,
        },
      }),
    ]);
    return {
      success: true,
      message: 'Reset all individual SEO settings to system defaults',
    };
  }
}
