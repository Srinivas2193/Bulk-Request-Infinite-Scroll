# 🚀 Infinite Scroll Photos App

A modern React + TypeScript application demonstrating infinite scrolling with search, filter, and sort capabilities using TanStack Query and Material-UI.

## ✨ Features

- **Infinite Scrolling**: Automatically loads more photos as you scroll down
- **Search**: Real-time search with debouncing (500ms delay)
- **Filter by Album**: Filter photos by album ID
- **Sort Options**: Sort by ID or title (ascending/descending)
- **Responsive Design**: Beautiful UI built with Material-UI
- **Performance Optimized**: Uses TanStack Query for efficient data fetching and caching
- **TypeScript**: Fully typed for better developer experience

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **TanStack Query v5** - Data fetching and caching
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **JSONPlaceholder API** - Photo data source

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── PhotoCard.tsx   # Individual photo card
│   ├── SearchFilters.tsx # Search and filter controls
│   └── LoadingSpinner.tsx # Loading indicator
├── hooks/              # Custom React hooks
│   ├── usePhotos.ts    # Infinite query hook for photos
│   └── useDebounce.ts  # Debounce hook for search
├── pages/              # Page components
│   └── Photos.tsx      # Main photos page
├── services/           # API services
│   └── api.ts          # Photo API integration
├── types/              # TypeScript type definitions
│   └── photo.ts        # Photo-related types
├── App.tsx             # Root component with providers
├── index.tsx           # Entry point
└── index.css           # Global styles
```

## 🎯 Key Implementation Details

### Infinite Scrolling

Uses **Intersection Observer API** to detect when the user scrolls near the bottom of the page and automatically fetches the next page of data.

### Search & Filter

- **Debounced Search**: Waits 500ms after user stops typing before fetching
- **Query Key Management**: Changes to search, filter, or sort trigger fresh data fetch
- **Server-side Pagination**: Only fetches 50 items per API call (not all 5000 at once!)
- **Hybrid Filtering**: Album filter uses server-side params, search/sort applied client-side

### Data Management

- **TanStack Query**: Handles caching, background updates, and query invalidation
- **Server-side Pagination**: Only loads 50 photos per API call using `_page` and `_limit` params
- **Efficient Loading**: Fetches next batch only when scrolling reaches bottom
- **Optimistic UI**: Shows loading states for better UX

## 📝 API Integration

**Endpoint**: `https://jsonplaceholder.typicode.com/photos`

### Server-side Pagination
The app uses query parameters to fetch only needed data:
- **Initial load**: `GET /photos?_page=1&_limit=50` (first 50 photos)
- **Scroll down**: `GET /photos?_page=2&_limit=50` (next 50 photos)
- **With album filter**: `GET /photos?_page=1&_limit=50&albumId=5`

This means we only load 50 photos at a time instead of all 5000! 🚀

### Photo Structure
```typescript
{
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}
```

## 🎨 UI Features

- **Modern Design**: Gradient header, smooth hover effects
- **Responsive Grid**: 1-4 columns based on screen size
- **Loading States**: Spinner for initial load and pagination
- **Empty States**: Helpful messages when no results found
- **Scroll to Top**: Button appears after scrolling past 50 photos

## 🚀 Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Photos API: [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- UI Library: [Material-UI](https://mui.com/)
- Data Fetching: [TanStack Query](https://tanstack.com/query)

