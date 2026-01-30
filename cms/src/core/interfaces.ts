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
  updatedAt: string;
}

export interface IComicService {
  getComics(query?: string): Promise<Comic[]>;
  getComic(slug: string): Promise<Comic | null>;
  getComicById(id: string): Promise<Comic | null>;
  createComic(data: any): Promise<Comic>;
  updateComic(id: string, data: any): Promise<Comic>;
  deleteComic(id: string): Promise<void>;
  uploadImage(file: File): Promise<{ url: string }>;
  getChapters(comicId: string): Promise<any[]>;
  createChapter(data: any): Promise<any>;
  updateChapter(id: string, data: any): Promise<any>;
  deleteChapter(id: string): Promise<void>;
  getTags(): Promise<any[]>;
  createCategory(data: any): Promise<any>;
  createTag(data: any): Promise<any>;
}

export interface ISettingService {
  getSettings(): Promise<any>;
  updateSettings(data: any): Promise<any>;
  getSeo(): Promise<any>;
  updateSeo(data: any): Promise<any>;
}
