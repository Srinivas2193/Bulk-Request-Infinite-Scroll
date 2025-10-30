import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Typography,
  Box,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Photo } from '../types/photo';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

interface BulkRequestModalProps {
  open: boolean;
  onClose: () => void;
  photos: Photo[];
}

export const BulkRequestModal = ({ open, onClose, photos }: BulkRequestModalProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTogglePhoto = (photoId: number) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const handleSendBulkRequest = () => {
    const selected = photos.filter(photo => selectedPhotos.has(photo.id));

    // Email configuration (pre-filled but user can edit)
    const toEmails = ['kiranr@ideyalabs.com', 'muralich@ideyalabs.com'];
    const subject = 'Daylight Tracking Update Bulk Request - Carrier Name';
    
    // Create HTML table rows (empty template for user to fill)
    let tableRows = '';
    for (let i = 0; i < selected.length; i++) {
      tableRows += `      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
`;
    }
    
    // Create HTML email content
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #999; padding: 8px; text-align: left; word-wrap: break-word; }
    th { font-weight: bold; color: #333; white-space: nowrap; }
    .red-text { color: #FF0000; }
    .col-trip { width: 80px; }
    .col-booking { width: 90px; }
    .col-origin { width: 70px; }
    .col-stop { width: 100px; }
    .col-dest { width: 70px; }
    .col-ddhd-org { width: 110px; }
    .col-ddhd-dest { width: 120px; }
    .col-trailer { width: 85px; }
    .col-location { width: auto; }
  </style>
</head>
<body>
  <p>Hi Team,</p>
  
  <p>Please provide a current tracking update on the following:</p>
  
  <table>
    <colgroup>
      <col class="col-trip">
      <col class="col-booking">
      <col class="col-origin">
      <col class="col-stop">
      <col class="col-dest">
      <col class="col-ddhd-org">
      <col class="col-ddhd-dest">
      <col class="col-trailer">
      <col class="col-location">
    </colgroup>
    <thead>
      <tr>
        <th>Trip<br/>Number</th>
        <th>Booking<br/>Number</th>
        <th>Origin</th>
        <th>Stop<br/><span class="red-text">(if applicable)</span></th>
        <th>Dest</th>
        <th>DDHD Org<br/><span class="red-text">(if applicable)</span></th>
        <th>DDHD Dest<br/><span class="red-text">(if applicable)</span></th>
        <th>Trailer<br/>Number</th>
        <th>Last Known<br/>Tracking Location</th>
      </tr>
    </thead>
    <tbody>
${tableRows}    </tbody>
  </table>
  
  <p>Thank you,</p>
  
  <p><strong>**BULK REQUEST TEMPLATE**</strong></p>
</body>
</html>`;

    // Create EML file with proper MIME headers for HTML rendering
    // Using X-Unsent: 1 to make Outlook treat it as a draft
    const emlContent = `X-Unsent: 1
To: ${toEmails.join('; ')}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${htmlContent}`;

    // Create and download EML file
    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-request-template.eml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    // Show success message
    setSnackbarMessage('✓ Email draft downloaded! Double-click to open in Outlook - you can edit and send.');
    setSnackbarOpen(true);
    
    // Close modal after brief delay
    setTimeout(() => {
      setSelectedPhotos(new Set());
      onClose();
    }, 2000);
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Bulk Request - Select Photos
          </Typography>
          <Button
            size="small"
            onClick={handleSelectAll}
            variant="outlined"
          >
            {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Showing first 50 photos. Select photos to send bulk request.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {selectedPhotos.size > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
          </Alert>
        )}

        <Grid container spacing={2}>
          {photos.slice(0, 50).map((photo) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedPhotos.has(photo.id) ? '2px solid' : '2px solid transparent',
                  borderColor: selectedPhotos.has(photo.id) ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleTogglePhoto(photo.id)}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '4px'
                  }}
                >
                  <Checkbox
                    checked={selectedPhotos.has(photo.id)}
                    onChange={() => handleTogglePhoto(photo.id)}
                    onClick={(e) => e.stopPropagation()}
                    color="primary"
                  />
                </Box>

                <CardMedia
                  component="img"
                  height="150"
                  image={photo.thumbnailUrl}
                  alt={photo.title}
                  sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                />

                <CardContent>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Album ${photo.albumId}`}
                      size="small"
                      color="primary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={`ID: ${photo.id}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
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
                      minHeight: '40px',
                      fontSize: '0.8rem'
                    }}
                  >
                    {photo.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {selectedPhotos.size} of {Math.min(50, photos.length)} photos selected
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendBulkRequest}
            disabled={selectedPhotos.size === 0}
            startIcon={<SendIcon />}
            variant="contained"
            color="primary"
          >
            Send Bulk Request
          </Button>
        </Box>
      </DialogActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
};

