# Video Upload Setup with Cloudflare R2

## Overview
This implementation provides automatic video categorization:
- **Shorts**: Videos ≤ 60 seconds
- **Videos**: Videos > 60 seconds

## Environment Variables Required

Add these to your `.env` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_ACCESS_KEY_ID="your_access_key_id"
CLOUDFLARE_SECRET_ACCESS_KEY="your_secret_access_key"
CLOUDFLARE_BUCKET_NAME="your_bucket_name"
```

## Cloudflare R2 Setup

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard > R2 Object Storage
   - Create a new bucket for video storage

2. **Create API Token**:
   - Go to Cloudflare Dashboard > My Profile > API Tokens
   - Create a custom token with R2 permissions
   - Note down the Account ID, Access Key ID, and Secret Access Key

3. **Configure CORS** (if needed):
   - In your R2 bucket settings, configure CORS for your domain

## API Endpoints

### Upload Video File
```
POST /api/videos/upload/file
Content-Type: multipart/form-data

Form Data:
- video: File (video file)
- title: string (required)
- description: string (optional)
- tags: string (JSON array, optional)
- isPublic: boolean (optional, default: true)
- userId: string (required)
```

### Upload Video Metadata Only
```
POST /api/videos/upload
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "duration": number,
  "thumbnail": "string",
  "videoUrl": "string",
  "userId": "string",
  "tags": ["string"],
  "isPublic": boolean
}
```

### Get Videos
```
GET /api/videos - Get all public videos
GET /api/videos/shorts - Get all public shorts
GET /api/videos/user/:userId - Get videos by user
GET /api/videos/shorts/user/:userId - Get shorts by user
GET /api/videos/:id - Get video by ID
GET /api/videos/shorts/:id - Get short by ID
```

## Features

### Automatic Categorization
- Videos ≤ 60 seconds are automatically saved to the `shorts` table
- Videos > 60 seconds are saved to the `videos` table
- User statistics are updated accordingly

### Multipart Upload
- Supports large video files through Cloudflare R2 multipart upload
- Automatic chunking for files > 10MB
- Progress tracking and error handling

### Database Schema
- `videos` table: Stores regular videos (> 60s)
- `shorts` table: Stores short videos (≤ 60s)
- Both tables track views, likes, upload date, and metadata

## Frontend Integration

The frontend upload page (`/upload`) now:
- Accepts video file uploads
- Shows upload progress
- Displays categorization result
- Handles errors gracefully

## Usage Example

1. Navigate to `/upload` in the frontend
2. Select a video file (≤ 100MB)
3. Enter title and description
4. Click "Upload Video"
5. System automatically categorizes as short or video
6. Success message shows the categorization result

## Error Handling

- File size validation (100MB limit)
- Video format validation
- Network error handling
- R2 upload error handling
- Database error handling

## Future Enhancements

- Video duration extraction from uploaded files
- Automatic thumbnail generation
- Video processing and transcoding
- Progress bars for upload
- Resume upload functionality
- Video preview before upload 