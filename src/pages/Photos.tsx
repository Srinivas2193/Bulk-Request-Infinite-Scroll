import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  Button,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { PhotoCard } from '../components/PhotoCard';
import { SearchFilters } from '../components/SearchFilters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BulkRequestModal } from '../components/BulkRequestModal';
import { VirtualizedPhotoTable } from '../components/VirtualizedPhotoTable';
import { usePhotos } from '../hooks/usePhotos';
import { PhotoFilters } from '../types/photo';
import ImageIcon from '@mui/icons-material/Image';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

export const Photos = () => {
  const [currentTab, setCurrentTab] = useState(0);
  
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f5f7fa',
        overflow: 'hidden',
        py: 2,
        pb: 7  // Padding for fixed footer and gap
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', pb: 2 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white',
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ fontSize: 36, mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Photo Gallery
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
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

        {/* Tabs */}
        <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, flexShrink: 0 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: '0.95rem',
                fontWeight: 600,
                py: 1.5
              }
            }}
          >
            <Tab label="General Approach" />
            <Tab label="React Window Approach" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
          <>
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
          </>
          </Box>
        )}

        {/* React Window Approach Tab */}
        {currentTab === 1 && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <VirtualizedPhotoTable onBulkRequestOpen={handleBulkRequestOpen} />
          </Box>
        )}

        {/* Dark Footer - Copyright Statement (Fixed at Bottom) */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            textAlign: 'center',
            py: 1,
            zIndex: 1000,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            © {new Date().getFullYear()} Photo Gallery | Built with React, Material-UI, TanStack Query & React Window | All Rights Reserved
          </Typography>
        </Box>

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

