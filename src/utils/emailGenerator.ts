import { Photo } from '../types/photo';

export const generateEmailBody = (photos: Photo[]): string => {
  // Create simple text body for mailto
  let emailBody = `Hello,\n\nPlease find the bulk photo request details below.\n\n`;
  emailBody += `Total Photos Requested: ${photos.length}\n\n`;
  emailBody += `Please see the table with photo details.\n\n`;
  emailBody += `Best regards,\nPhoto Gallery System`;

  return emailBody;
};

// Generate HTML table for copying to Outlook
export const generateHTMLEmailTable = (photos: Photo[]): string => {
  let html = `<html>
<head>
  <style>
    body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #4472C4; color: white; font-weight: bold; }
    tr:nth-child(even) { background-color: #F2F2F2; }
    .header { margin-bottom: 10px; }
  </style>
</head>
<body>
  <p class="header">Hello,</p>
  <p class="header">Please find the bulk photo request details below:</p>
  <p class="header"><strong>Total Photos Requested: ${photos.length}</strong></p>
  
  <table>
    <thead>
      <tr>
        <th style="width: 60px;">ID</th>
        <th style="width: 80px;">Album ID</th>
        <th>Title</th>
        <th style="width: 100px;">Thumbnail</th>
        <th style="width: 150px;">URL</th>
      </tr>
    </thead>
    <tbody>`;

  photos.forEach((photo) => {
    html += `
      <tr>
        <td>${photo.id}</td>
        <td>${photo.albumId}</td>
        <td>${photo.title}</td>
        <td><img src="${photo.thumbnailUrl}" alt="" width="50" height="50" style="display: block;" /></td>
        <td><a href="${photo.url}">View Photo</a></td>
      </tr>`;
  });

  html += `
    </tbody>
  </table>
  
  <p style="margin-top: 20px;">Best regards,<br/>Photo Gallery System</p>
</body>
</html>`;

  return html;
};

// Copy HTML to clipboard
export const copyHTMLToClipboard = async (html: string): Promise<boolean> => {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (error) {
    console.error('Failed to copy HTML to clipboard:', error);
    // Fallback method
    try {
      const textarea = document.createElement('textarea');
      textarea.value = html;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy also failed:', fallbackError);
      return false;
    }
  }
};

