export interface Comic {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  author?: string;
  status: string;
  views: number;
  rating: number;
  description?: string;
  categories?: { id: string, name: string }[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  updatedAt: string;
}

export interface IComicService {
  getComics(query?: string): Promise<Comic[]>;
  getComic(slug: string): Promise<Comic | null>;
  getComicById(id: string): Promise<Comic | null>;
  createComic(data: any): Promise<Comic>;
  updateComic(id: string, data: any): Promise<Comic>;
  deleteComic(id: string): Promise<void>;
}

export interface IChapterService {
  getChapters(comicId: string): Promise<any[]>;
  createChapter(data: any): Promise<any>;
  updateChapter(id: string, data: any): Promise<any>;
  deleteChapter(id: string): Promise<void>;
}

export interface ICategoryService {
  getCategories(): Promise<any[]>;
  createCategory(data: any): Promise<any>;
  updateCategory(id: string, data: any): Promise<any>;
  deleteCategory(id: string): Promise<void>;
}

export interface ITagService {
  getTags(): Promise<any[]>;
  createTag(data: any): Promise<any>;
  updateTag(id: string, data: any): Promise<any>;
  deleteTag(id: string): Promise<void>;
}

export interface IMediaService {
  uploadImage(file: File): Promise<{ url: string }>;
  getMedia(params?: any): Promise<{ data: any[], meta: any }>;
  deleteMedia(id: string): Promise<void>;
  updateMedia(id: string, data: any): Promise<any>;
}

export interface ISettingService {
  getSettings(): Promise<any>;
  updateSettings(data: any): Promise<any>;
  getSeo(): Promise<any>;
  updateSeo(data: any): Promise<any>;
  resetSeo(): Promise<any>;
}
