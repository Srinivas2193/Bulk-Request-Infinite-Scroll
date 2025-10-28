import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PhotoFilters } from '../types/photo';
import { useQuery } from '@tanstack/react-query';
import { photosApi } from '../services/api';

interface SearchFiltersProps {
  filters: PhotoFilters;
  onFiltersChange: (filters: PhotoFilters) => void;
}

export const SearchFilters = ({
  filters,
  onFiltersChange
}: SearchFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Fetch album IDs for the filter dropdown
  const { data: albumIds = [] } = useQuery({
    queryKey: ['albumIds'],
    queryFn: photosApi.getAlbumIds,
    staleTime: Infinity
  });

  // Update parent component with search value (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleAlbumChange = (event: SelectChangeEvent) => {
    onFiltersChange({ ...filters, albumId: event.target.value });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    onFiltersChange({
      ...filters,
      sortBy: event.target.value as PhotoFilters['sortBy']
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#fff',
        borderRadius: 2
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 2
        }}
      >
        {/* Search Input */}
        <TextField
          fullWidth
          label="Search photos"
          variant="outlined"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Search by title..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />

        {/* Album Filter */}
        <FormControl fullWidth>
          <InputLabel>Album</InputLabel>
          <Select
            value={filters.albumId}
            label="Album"
            onChange={handleAlbumChange}
          >
            <MenuItem value="">All Albums</MenuItem>
            {albumIds.map((albumId) => (
              <MenuItem key={albumId} value={albumId.toString()}>
                Album {albumId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="id-asc">ID: Low to High</MenuItem>
            <MenuItem value="id-desc">ID: High to Low</MenuItem>
            <MenuItem value="title-asc">Title: A to Z</MenuItem>
            <MenuItem value="title-desc">Title: Z to A</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

