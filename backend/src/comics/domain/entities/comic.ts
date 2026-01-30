import { ComicStatus } from '../../infrastructure/dtos/comic.dto';

export class Comic {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  banner?: string;
  description?: string;
  author?: string;
  creatorId?: string;
  status: ComicStatus;
  rating: number;
  views: number;
  updatedAt: Date;
  createdAt: Date;
  
  // Relations (optional/partial for domain)
  categories?: any[];
  chapters?: any[];

  constructor(partial: Partial<Comic>) {
    Object.assign(this, partial);
  }
}
