import axios from 'axios';
import { Comic, ICategoryService, IChapterService, IComicService, IMediaService, ISettingService, ITagService } from '../core/interfaces';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Security: Use axios interceptor for JWT
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ComicService implements IComicService {
  async getComics(query?: string): Promise<Comic[]> {
    try {
      const res = await api.get('/comics', { params: { q: query } });
      return res.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getComic(slug: string): Promise<Comic | null> {
    const res = await api.get(`/comics/${slug}`);
    return res.data;
  }

  async getComicById(id: string): Promise<Comic | null> {
    const res = await api.get(`/comics/id/${id}`);
    return res.data;
  }

  async createComic(data: any): Promise<Comic> {
    const res = await api.post('/comics', data);
    return res.data;
  }

  async updateComic(id: string, data: any): Promise<Comic> {
    const res = await api.patch(`/comics/${id}`, data);
    return res.data;
  }

  async deleteComic(id: string): Promise<void> {
    await api.delete(`/comics/${id}`);
  }
}

export class ChapterService implements IChapterService {
  async getChapters(comicId: string): Promise<any[]> {
    const res = await api.get(`/chapters/comic/${comicId}`);
    return res.data;
  }

  async createChapter(data: any): Promise<any> {
    const res = await api.post('/chapters', data);
    return res.data;
  }

  async updateChapter(id: string, data: any): Promise<any> {
    const res = await api.patch(`/chapters/${id}`, data);
    return res.data;
  }

  async deleteChapter(id: string): Promise<void> {
    await api.delete(`/chapters/${id}`);
  }
}

export class CategoryService implements ICategoryService {
  async getCategories(): Promise<any[]> {
    const res = await api.get('/categories');
    return res.data;
  }

  async createCategory(data: any): Promise<any> {
    const res = await api.post('/categories', data);
    return res.data;
  }

  async updateCategory(id: string, data: any): Promise<any> {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export class TagService implements ITagService {
  async getTags(): Promise<any[]> {
    const res = await api.get('/tags');
    return res.data;
  }

  async createTag(data: any): Promise<any> {
    const res = await api.post('/tags', data);
    return res.data;
  }

  async updateTag(id: string, data: any): Promise<any> {
    const res = await api.patch(`/tags/${id}`, data);
    return res.data;
  }

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  }
}

export class MediaService implements IMediaService {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async getMedia(params?: any): Promise<{ data: any[], meta: any }> {
    const res = await api.get('/media', { params });
    return res.data;
  }

  async deleteMedia(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  }

  async updateMedia(id: string, data: any): Promise<any> {
    const res = await api.patch(`/media/${id}`, data);
    return res.data;
  }
}

export class SettingService implements ISettingService {
  async getSettings(): Promise<any> {
    const res = await api.get('/settings');
    return res.data;
  }

  async updateSettings(data: any): Promise<any> {
    const res = await api.patch('/settings', data);
    return res.data;
  }

  async getSeo(): Promise<any> {
    const res = await api.get('/settings/seo');
    return res.data;
  }

  async updateSeo(data: any): Promise<any> {
    const res = await api.patch('/settings/seo', data);
    return res.data;
  }

  async resetSeo(): Promise<any> {
    const res = await api.post('/settings/seo/reset');
    return res.data;
  }
}

// Dependency Injection Registry
// Dependency Injection Registry
export const comicService = new ComicService();
export const chapterService = new ChapterService();
export const categoryService = new CategoryService();
export const tagService = new TagService();
export const mediaService = new MediaService();
export const settingService = new SettingService();

export class UserService {
    async getUsers(params?: any): Promise<{ data: any[], total: number }> {
        const res = await api.get('/users', { params });
        return res.data;
    }

    async updateStatus(id: string, status: string): Promise<void> {
        await api.patch(`/users/${id}/status`, { status });
    }

    async updateRole(id: string, data: any): Promise<void> {
        await api.patch(`/users/${id}/role`, data);
    }

    async resetPassword(id: string, newPassword: string): Promise<void> {
        await api.post(`/users/${id}/reset-password`, { newPassword });
    }
}


export class RoleService {
    async getRoles(): Promise<any[]> {
        const res = await api.get('/roles');
        return res.data;
    }

    async createRole(data: any): Promise<any> {
        const res = await api.post('/roles', data);
        return res.data;
    }

    async updateRole(id: string, data: any): Promise<any> {
        const res = await api.patch(`/roles/${id}`, data);
        return res.data;
    }

    async deleteRole(id: string): Promise<void> {
        await api.delete(`/roles/${id}`);
    }
}

export const userService = new UserService();
export const roleService = new RoleService();
