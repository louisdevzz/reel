# Bookmark and Like API Documentation

## Overview
This document describes the bookmark and like functionality for the Reel platform. Bookmarking is only available for shorts, while likes are available for both videos and shorts.

## Database Schema

### Tables Added
- `short_bookmarks` - Stores user bookmarks for shorts
- `video_likes` - Stores user likes for videos  
- `short_likes` - Stores user likes for shorts

## API Endpoints

### Bookmark Endpoints (Shorts Only)

#### Add Short Bookmark
```http
POST /api/users/bookmarks/shorts
Content-Type: application/json

{
  "userId": "user-uuid",
  "shortId": "short-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bookmark-uuid",
    "userId": "user-uuid",
    "shortId": "short-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Short bookmarked successfully"
}
```

#### Remove Short Bookmark
```http
DELETE /api/users/bookmarks/shorts
Content-Type: application/json

{
  "userId": "user-uuid",
  "shortId": "short-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

#### Get User's Short Bookmarks
```http
GET /api/users/{userId}/bookmarks/shorts?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "short": {
        "id": "short-uuid",
        "title": "Short Title",
        "description": "Short description",
        "thumbnail": "thumbnail-url",
        "videoUrl": "video-url",
        "views": 100,
        "likes": 50,
        "uploadDate": "2024-01-01T00:00:00Z",
        "userId": "user-uuid"
      },
      "bookmarkedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Check if Short is Bookmarked
```http
GET /api/users/bookmarks/shorts/check?userId={userId}&shortId={shortId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isBookmarked": true
  }
}
```

### Like Endpoints (Videos)

#### Add Video Like
```http
POST /api/users/likes/videos
Content-Type: application/json

{
  "userId": "user-uuid",
  "videoId": "video-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "like-uuid",
    "userId": "user-uuid",
    "videoId": "video-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Video liked successfully"
}
```

#### Remove Video Like
```http
DELETE /api/users/likes/videos
Content-Type: application/json

{
  "userId": "user-uuid",
  "videoId": "video-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Like removed successfully"
}
```

#### Get User's Video Likes
```http
GET /api/users/{userId}/likes/videos?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "video": {
        "id": "video-uuid",
        "title": "Video Title",
        "description": "Video description",
        "thumbnail": "thumbnail-url",
        "videoUrl": "video-url",
        "views": 1000,
        "likes": 150,
        "uploadDate": "2024-01-01T00:00:00Z",
        "userId": "user-uuid"
      },
      "likedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Check if Video is Liked
```http
GET /api/users/likes/videos/check?userId={userId}&videoId={videoId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isLiked": true
  }
}
```

### Like Endpoints (Shorts)

#### Add Short Like
```http
POST /api/users/likes/shorts
Content-Type: application/json

{
  "userId": "user-uuid",
  "shortId": "short-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "like-uuid",
    "userId": "user-uuid",
    "shortId": "short-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Short liked successfully"
}
```

#### Remove Short Like
```http
DELETE /api/users/likes/shorts
Content-Type: application/json

{
  "userId": "user-uuid",
  "shortId": "short-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Like removed successfully"
}
```

#### Get User's Short Likes
```http
GET /api/users/{userId}/likes/shorts?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "short": {
        "id": "short-uuid",
        "title": "Short Title",
        "description": "Short description",
        "thumbnail": "thumbnail-url",
        "videoUrl": "video-url",
        "views": 100,
        "likes": 50,
        "uploadDate": "2024-01-01T00:00:00Z",
        "userId": "user-uuid"
      },
      "likedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Check if Short is Liked
```http
GET /api/users/likes/shorts/check?userId={userId}&shortId={shortId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isLiked": true
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "User ID and Short ID are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Short already bookmarked"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to add bookmark",
  "error": "Error details"
}
```

## Features

### Bookmark Features
- ✅ Bookmark shorts only
- ✅ Remove bookmarks
- ✅ Get user's bookmarked shorts
- ✅ Check bookmark status
- ✅ Pagination support

### Like Features
- ✅ Like videos and shorts
- ✅ Unlike videos and shorts
- ✅ Get user's liked content
- ✅ Check like status
- ✅ Automatic like count updates
- ✅ Pagination support

### Database Features
- ✅ Foreign key constraints
- ✅ Automatic timestamps
- ✅ Transaction support for like operations
- ✅ Unique constraints to prevent duplicates

## Usage Examples

### Frontend Integration

```javascript
// Add bookmark
const addBookmark = async (userId, shortId) => {
  const response = await fetch('/api/users/bookmarks/shorts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, shortId })
  });
  return response.json();
};

// Add like
const addLike = async (userId, videoId, type = 'video') => {
  const endpoint = type === 'video' ? '/api/users/likes/videos' : '/api/users/likes/shorts';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, [type === 'video' ? 'videoId' : 'shortId']: videoId })
  });
  return response.json();
};

// Check status
const checkStatus = async (userId, contentId, type = 'like', contentType = 'video') => {
  const endpoint = type === 'bookmark' 
    ? '/api/users/bookmarks/shorts/check'
    : `/api/users/likes/${contentType}s/check`;
  const response = await fetch(`${endpoint}?userId=${userId}&${contentType}Id=${contentId}`);
  return response.json();
};
``` 