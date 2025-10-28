import axios from 'axios';
import { Photo, PhotosResponse } from '../types/photo';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
const ITEMS_PER_PAGE = 50;
const TOTAL_PHOTOS = 5000; // JSONPlaceholder has 5000 photos

export const photosApi = {
  fetchPhotos: async ({
    page = 1,
    search = '',
    albumId = '',
    sortBy = 'id-asc'
  }): Promise<PhotosResponse> => {
    try {
      // Build query parameters for server-side pagination
      const params: any = {
        _page: page,
        _limit: ITEMS_PER_PAGE
      };

      // Add album filter if specified
      if (albumId) {
        params.albumId = parseInt(albumId);
      }

      // Fetch ONLY the current page from API (not all 5000)
      const response = await axios.get<Photo[]>(`${API_BASE_URL}/photos`, {
        params
      });

      let photos = response.data;

      // Apply client-side search filter (since API doesn't support it)
      if (search) {
        const searchLower = search.toLowerCase();
        photos = photos.filter(photo =>
          photo.title.toLowerCase().includes(searchLower)
        );
      }

      // Apply client-side sorting (since API doesn't support custom sorting)
      photos = [...photos].sort((a, b) => {
        switch (sortBy) {
          case 'id-asc':
            return a.id - b.id;
          case 'id-desc':
            return b.id - a.id;
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });

      // Calculate if there are more pages
      // JSONPlaceholder returns empty array when no more data
      const hasMore = photos.length === ITEMS_PER_PAGE && 
                      (page * ITEMS_PER_PAGE) < TOTAL_PHOTOS;

      return {
        items: photos,
        hasMore,
        nextPage: hasMore ? page + 1 : undefined
      };
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  // Get unique album IDs for filter dropdown
  getAlbumIds: async (): Promise<number[]> => {
    try {
      // JSONPlaceholder has 100 albums (IDs 1-100)
      // Instead of fetching all 5000 photos, we can just generate the array
      // or fetch a sample to get actual album IDs
      const response = await axios.get<Photo[]>(`${API_BASE_URL}/photos`, {
        params: { _page: 1, _limit: 100 }
      });
      const albumIds = [...new Set(response.data.map(photo => photo.albumId))];
      return albumIds.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error fetching album IDs:', error);
      throw error;
    }
  }
};

