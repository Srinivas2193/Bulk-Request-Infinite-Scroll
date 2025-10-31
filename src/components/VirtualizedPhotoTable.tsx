import { useState, useCallback, useMemo, memo, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { List, RowComponentProps } from 'react-window';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Photo, PhotoFilters } from '../types/photo';
import { usePhotos } from '../hooks/usePhotos';

// Define custom row props for our virtualized list
interface CustomRowProps {
  photos: Photo[];
  hasMore: boolean;
}

interface VirtualizedPhotoTableProps {
  onBulkRequestOpen?: () => void;
}

// Table row component for react-window v2 virtualization
const Row = memo<RowComponentProps<CustomRowProps>>(({ index, style, ariaAttributes, photos, hasMore }) => {
  // Show loader at the end
  if (hasMore && index === photos.length) {
    return (
      <div style={style} {...ariaAttributes}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            height: '100%'
          }}
        >
          <CircularProgress size={24} />
        </Box>
      </div>
    );
  }

  const photo = photos[index];
  if (!photo) return <div style={style} {...ariaAttributes} />;

  return (
    <div style={style} {...ariaAttributes}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
          height: '100%',
          '&:hover': {
            backgroundColor: '#f0f0f0'
          }
        }}
      >
      <Box sx={{ width: '80px', p: 1.5, borderRight: '1px solid #eee', fontSize: '0.875rem' }}>
        {photo.id}
      </Box>
      <Box sx={{ width: '100px', p: 1.5, borderRight: '1px solid #eee', fontSize: '0.875rem' }}>
        <Chip label={photo.albumId} size="small" color="primary" />
      </Box>
      <Box sx={{ 
        width: '120px', 
        p: 1, 
        borderRight: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          onError={(e) => {
            // Fallback to placeholder if JSONPlaceholder image fails to load
            const target = e.currentTarget;
            target.onerror = null; // Prevent infinite loop
            target.src = `https://placehold.co/50x50/667eea/white?text=ID:${photo.id}`;
          }}
          loading="lazy"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0'
          }}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          p: 1.5,
          borderRight: '1px solid #eee',
          fontSize: '0.875rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {photo.title}
      </Box>
        <Box sx={{ width: '150px', p: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          <a href={photo.url} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
            View Photo
          </a>
        </Box>
      </Box>
    </div>
  );
});

Row.displayName = 'VirtualizedTableRow';

export const VirtualizedPhotoTable = ({ onBulkRequestOpen: _onBulkRequestOpen }: VirtualizedPhotoTableProps) => {
  const [filters, setFilters] = useState<PhotoFilters>({
    search: '',
    albumId: '',
    sortBy: 'id-asc'
  });

  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  
  // Ref to track if we're currently loading to prevent multiple calls
  const isLoadingRef = useRef(false);
  const lastLoadedIndexRef = useRef(-1);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = usePhotos({ filters });

  // Flatten all pages of photos
  const allPhotos = useMemo(() => {
    const photos = data?.pages.flatMap((page) => page.items) ?? [];
    // Debug: Log first photo to verify API response
    if (photos.length > 0 && photos[0]) {
      console.log('Sample photo data:', {
        id: photos[0].id,
        thumbnailUrl: photos[0].thumbnailUrl,
        url: photos[0].url
      });
    }
    return photos;
  }, [data]);

  // Apply quick filters
  const filteredPhotos = useMemo(() => {
    let filtered = [...allPhotos];

    if (quickFilters.includes('even-ids')) {
      filtered = filtered.filter(photo => photo.id % 2 === 0);
    }
    if (quickFilters.includes('odd-ids')) {
      filtered = filtered.filter(photo => photo.id % 2 !== 0);
    }
    if (quickFilters.includes('album-1-5')) {
      filtered = filtered.filter(photo => photo.albumId >= 1 && photo.albumId <= 5);
    }
    if (quickFilters.includes('album-6-10')) {
      filtered = filtered.filter(photo => photo.albumId >= 6 && photo.albumId <= 10);
    }

    return filtered;
  }, [allPhotos, quickFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleAlbumChange = (e: any) => {
    setFilters(prev => ({ ...prev, albumId: e.target.value }));
  };

  const handleSortChange = (e: any) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const toggleQuickFilter = (filter: string) => {
    setQuickFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle infinite scroll within the virtualized list
  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      // Load more when we're within 10 items of the end
      const threshold = 10;
      const triggerIndex = filteredPhotos.length - threshold;
      
      const shouldLoadMore = 
        visibleRows.stopIndex >= triggerIndex &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isLoadingRef.current &&
        lastLoadedIndexRef.current !== triggerIndex;
      
      if (shouldLoadMore) {
        console.log('🔄 Loading more photos - Trigger Index:', triggerIndex, 'Current Length:', filteredPhotos.length);
        isLoadingRef.current = true;
        lastLoadedIndexRef.current = triggerIndex;
        
        // Add 2 second delay for better UX - users can see loading indicator
        setTimeout(() => {
          fetchNextPage().finally(() => {
            isLoadingRef.current = false;
            console.log('✅ Loading complete - New Length:', filteredPhotos.length);
          });
        }, 2000);
      }
    },
    [filteredPhotos.length, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Table header
  const TableHeader = () => (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: '#667eea',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        borderBottom: '2px solid #ddd',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}
    >
      <Box sx={{ width: '80px', p: 1.5, borderRight: '1px solid rgba(255,255,255,0.3)' }}>ID</Box>
      <Box sx={{ width: '100px', p: 1.5, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Album ID</Box>
      <Box sx={{ width: '120px', p: 1.5, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Thumbnail</Box>
      <Box sx={{ flex: 1, p: 1.5, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Title</Box>
      <Box sx={{ width: '150px', p: 1.5 }}>Actions</Box>
    </Box>
  );

  const itemCount = hasNextPage ? filteredPhotos.length + 1 : filteredPhotos.length;

  // Memoize rowProps to prevent unnecessary re-renders
  const rowProps = useMemo(
    () => ({ photos: filteredPhotos, hasMore: hasNextPage || false }),
    [filteredPhotos, hasNextPage]
  );

  // Memoize style object to prevent re-renders
  const listStyle = useMemo(
    () => ({ 
      height: '350px', // Reduced height to see table end clearly
      overflowX: 'hidden' as const
    }),
    []
  );

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Search and Filters Section */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, flexShrink: 0 }}>
        <Stack spacing={2}>
          {/* Search and Dropdown Filters */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search photos by title..."
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Album</InputLabel>
              <Select value={filters.albumId} onChange={handleAlbumChange} label="Album">
                <MenuItem value="">All Albums</MenuItem>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((album) => (
                  <MenuItem key={album} value={album}>
                    Album {album}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={filters.sortBy} onChange={handleSortChange} label="Sort By">
                <MenuItem value="id-asc">ID: Low to High</MenuItem>
                <MenuItem value="id-desc">ID: High to Low</MenuItem>
                <MenuItem value="title-asc">Title: A to Z</MenuItem>
                <MenuItem value="title-desc">Title: Z to A</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Quick Filter Chips */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FilterListIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Quick Filters
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="Even IDs"
                size="small"
                onClick={() => toggleQuickFilter('even-ids')}
                color={quickFilters.includes('even-ids') ? 'primary' : 'default'}
                variant={quickFilters.includes('even-ids') ? 'filled' : 'outlined'}
              />
              <Chip
                label="Odd IDs"
                size="small"
                onClick={() => toggleQuickFilter('odd-ids')}
                color={quickFilters.includes('odd-ids') ? 'primary' : 'default'}
                variant={quickFilters.includes('odd-ids') ? 'filled' : 'outlined'}
              />
              <Chip
                label="Albums 1-5"
                size="small"
                onClick={() => toggleQuickFilter('album-1-5')}
                color={quickFilters.includes('album-1-5') ? 'secondary' : 'default'}
                variant={quickFilters.includes('album-1-5') ? 'filled' : 'outlined'}
              />
              <Chip
                label="Albums 6-10"
                size="small"
                onClick={() => toggleQuickFilter('album-6-10')}
                color={quickFilters.includes('album-6-10') ? 'secondary' : 'default'}
                variant={quickFilters.includes('album-6-10') ? 'filled' : 'outlined'}
              />
            </Stack>
          </Box>

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary">
            Showing {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
            {hasNextPage && ' (scroll for more)'}
          </Typography>
        </Stack>
      </Paper>

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading photos: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {/* Loading State (Initial) */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          py: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'rotate 6s linear infinite',
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: 'white',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                mb: 3
              }} 
            />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                color: 'white',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                mb: 1
              }}
            >
              Loading Photos...
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontStyle: 'italic'
              }}
            >
              Preparing your gallery experience
            </Typography>
            
            {/* Animated dots */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5, 
              mt: 3,
              justifyContent: 'center'
            }}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { 
                        transform: 'scale(0)',
                        opacity: 0.5
                      },
                      '40%': { 
                        transform: 'scale(1)',
                        opacity: 1
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Virtualized Table */}
      {!isLoading && (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', mb: 5 }}>
          {filteredPhotos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No photos found
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <TableHeader />
              <Box sx={{ flex: 1 }}>
                {/* @ts-ignore - react-window v2 type issue */}
                <List
                  rowComponent={Row as any}
                  rowCount={itemCount}
                  rowHeight={70}
                  rowProps={rowProps}
                  style={listStyle}
                  onRowsRendered={handleRowsRendered}
                />
              </Box>
            </Box>
          )}

          {/* Footer Info */}
          {isFetchingNextPage && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              py: 3.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderTop: '3px solid #5568d3',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              },
              '@keyframes shimmer': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                position: 'relative',
                zIndex: 1
              }}>
                <CircularProgress 
                  size={32} 
                  thickness={4}
                  sx={{ 
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }} 
                />
                <Box>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    sx={{ 
                      color: 'white',
                      letterSpacing: '0.5px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    Loading more photos...
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontStyle: 'italic'
                    }}
                  >
                    Please wait a moment
                  </Typography>
                </Box>
              </Box>
              
              {/* Animated dots */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 2,
                position: 'relative',
                zIndex: 1
              }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: `${i * 0.16}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { 
                          transform: 'scale(0)',
                          opacity: 0.5
                        },
                        '40%': { 
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {!hasNextPage && filteredPhotos.length > 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3.5,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              borderTop: '3px solid #0e8a7f',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent)',
                animation: 'pulse 3s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5 },
                '50%': { opacity: 1 }
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    color: 'white',
                    letterSpacing: '0.5px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    mb: 0.5
                  }}
                >
                  🎉 You've reached the end!
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: 500
                  }}
                >
                  Total: <strong>{filteredPhotos.length}</strong> amazing photos loaded
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

