import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { Photo } from '../types/photo';

interface PhotoCardProps {
  photo: Photo;
}

export const PhotoCard = ({ photo }: PhotoCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={photo.thumbnailUrl}
        alt={photo.title}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5'
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip
            label={`Album ${photo.albumId}`}
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          />
          <Chip
            label={`ID: ${photo.id}`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '40px'
          }}
        >
          {photo.title}
        </Typography>
      </CardContent>
    </Card>
  );
};

