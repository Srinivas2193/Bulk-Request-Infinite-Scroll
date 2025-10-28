export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface PhotosResponse {
  items: Photo[];
  hasMore: boolean;
  nextPage: number | undefined;
}

export interface PhotoFilters {
  search: string;
  albumId: string;
  sortBy: 'id-asc' | 'id-desc' | 'title-asc' | 'title-desc';
}

