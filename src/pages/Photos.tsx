import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { PhotoCard } from '../components/PhotoCard';
import { SearchFilters } from '../components/SearchFilters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BulkRequestModal } from '../components/BulkRequestModal';
import { usePhotos } from '../hooks/usePhotos';
import { PhotoFilters } from '../types/photo';
import ImageIcon from '@mui/icons-material/Image';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

export const Photos = () => {
  const [filters, setFilters] = useState<PhotoFilters>({
    search: '',
    albumId: '',
    sortBy: 'id-asc'
  });

  const [bulkRequestOpen, setBulkRequestOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = usePhotos({ filters });

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0.1 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  // Flatten all pages of photos
  const allPhotos = data?.pages.flatMap((page) => page.items) ?? [];

  const handleFiltersChange = (newFilters: PhotoFilters) => {
    setFilters(newFilters);
  };

  const handleBulkRequestOpen = () => {
    setBulkRequestOpen(true);
  };

  const handleBulkRequestClose = () => {
    setBulkRequestOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold">
                  Photo Gallery
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Infinite Scrolling with Search, Filter & Sort
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlaylistAddCheckIcon />}
              onClick={handleBulkRequestOpen}
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s'
              }}
            >
              Bulk Request
            </Button>
          </Box>
        </Paper>

        {/* Search and Filters */}
        <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Error State */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading photos: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        )}

        {/* Loading State (Initial) */}
        {isLoading && <LoadingSpinner message="Loading photos..." />}

        {/* Photos Grid */}
        {!isLoading && (
          <>
            {allPhotos.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  backgroundColor: 'white',
                  borderRadius: 2
                }}
              >
                <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No photos found
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  Try adjusting your search or filters
                </Typography>
              </Box>
            ) : (
              <>
                {/* Results Count */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}
                    {hasNextPage && ' (scroll for more)'}
                  </Typography>
                </Box>

                {/* Photo Grid */}
                <Grid container spacing={3}>
                  {allPhotos.map((photo) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                      <PhotoCard photo={photo} />
                    </Grid>
                  ))}
                </Grid>

                {/* Infinite Scroll Trigger */}
                <Box ref={observerTarget} sx={{ py: 4 }}>
                  {isFetchingNextPage && (
                    <LoadingSpinner message="Loading more photos..." />
                  )}
                  {!hasNextPage && allPhotos.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        🎉 You've reached the end!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </>
        )}

        {/* Scroll to Top Button */}
        {allPhotos.length > 50 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                borderRadius: '50%',
                minWidth: 56,
                height: 56,
                boxShadow: 4
              }}
            >
              ↑
            </Button>
          </Box>
        )}

        {/* Bulk Request Modal */}
        <BulkRequestModal
          open={bulkRequestOpen}
          onClose={handleBulkRequestClose}
          photos={allPhotos}
        />
      </Container>
    </Box>
  );
};

