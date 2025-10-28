import { useInfiniteQuery } from '@tanstack/react-query';
import { photosApi } from '../services/api';
import { PhotoFilters } from '../types/photo';

interface UsePhotosParams {
  filters: PhotoFilters;
}

export const usePhotos = ({ filters }: UsePhotosParams) => {
  return useInfiniteQuery({
    queryKey: ['photos', filters],
    queryFn: ({ pageParam = 1 }) =>
      photosApi.fetchPhotos({
        page: pageParam,
        search: filters.search,
        albumId: filters.albumId,
        sortBy: filters.sortBy
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

