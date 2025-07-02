# Engagement System Documentation

## Overview

The Reel platform now includes a comprehensive engagement system that tracks user interactions with videos and shorts, including views, likes, comments, shares, and bookmarks. The system uses a multi-layered architecture with Redis caching and message queues for scalability and real-time performance.

## Architecture

```
Frontend -->|Send ping/view event| API
    API --> Redis[Redis - Lưu view tạm]
    Redis --> Queue[Message Queue (Redis Lists)]
    Queue --> Worker[Worker xử lý view hợp lệ]
    Worker --> DB[Database - Ghi view thật]
    DB --> Analytics[Hệ thống thống kê / BI]
```

## Features Implemented

### 1. View Tracking
- **Real-time view tracking** with Redis caching
- **10-second minimum** for valid views
- **Bot detection** and rate limiting
- **Session-based tracking** to prevent duplicates
- **Background processing** via worker queues

### 2. Like System
- **Video likes** and **short likes** with rate limiting
- **Duplicate prevention** and user validation
- **Real-time count updates** in database
- **User like history** tracking

### 3. Comment System
- **Nested comments** with parent-child relationships
- **Rate limiting** (50 comments per hour per user)
- **Content validation** (1-1000 characters)
- **User permission** checks for editing/deleting

### 4. Share System
- **Multi-platform sharing** (Facebook, Twitter, etc.)
- **Share analytics** and platform breakdown
- **Rate limiting** (20 shares per hour per user)
- **Share URL tracking**

### 5. Bookmark System
- **Short bookmarks** with user collections
- **Bookmark management** (add/remove/check)
- **User bookmark history**

## API Endpoints

### View Tracking
```
POST /api/views/videos/:contentId     - Track video view
POST /api/views/shorts/:contentId     - Track short view
PUT /api/views/:viewId                - Update view progress
GET /api/views/videos/:contentId/stats - Get video view stats
GET /api/views/shorts/:contentId/stats - Get short view stats
GET /api/views/user/:userId/history   - Get user view history
POST /api/views/queue/videos/process  - Process video view queue
POST /api/views/queue/shorts/process  - Process short view queue
GET /api/views/health                 - Redis health check
```

### Comments
```
POST /api/comments/videos/:videoId    - Add video comment
DELETE /api/comments/videos/:commentId - Remove video comment
GET /api/comments/videos/:videoId     - Get video comments
PUT /api/comments/videos/:commentId   - Update video comment
POST /api/comments/shorts/:shortId    - Add short comment
DELETE /api/comments/shorts/:commentId - Remove short comment
GET /api/comments/shorts/:shortId     - Get short comments
PUT /api/comments/shorts/:commentId   - Update short comment
```

### Shares
```
POST /api/shares/videos/:videoId      - Add video share
GET /api/shares/videos/:videoId       - Get video shares
GET /api/shares/videos/:videoId/stats - Get video share stats
GET /api/shares/user/:userId/videos   - Get user's video shares
POST /api/shares/shorts/:shortId      - Add short share
GET /api/shares/shorts/:shortId       - Get short shares
GET /api/shares/shorts/:shortId/stats - Get short share stats
GET /api/shares/user/:userId/shorts   - Get user's short shares
```

### Likes (via User Routes)
```
POST /api/users/likes/videos          - Add video like
DELETE /api/users/likes/videos        - Remove video like
GET /api/users/:userId/likes/videos   - Get user's video likes
GET /api/users/likes/videos/check     - Check if video is liked
POST /api/users/likes/shorts          - Add short like
DELETE /api/users/likes/shorts        - Remove short like
GET /api/users/:userId/likes/shorts   - Get user's short likes
GET /api/users/likes/shorts/check     - Check if short is liked
```

### Bookmarks (via User Routes)
```
POST /api/users/bookmarks/shorts      - Add short bookmark
DELETE /api/users/bookmarks/shorts    - Remove short bookmark
GET /api/users/:userId/bookmarks/shorts - Get user's short bookmarks
GET /api/users/bookmarks/shorts/check - Check if short is bookmarked
```

## Rate Limiting

The system implements rate limiting using Redis:

- **Likes**: 100 per hour per user
- **Comments**: 50 per hour per user  
- **Shares**: 20 per hour per user

Rate limits are enforced at the API level and return HTTP 429 when exceeded.

## View Validation

Views are validated using the following criteria:

1. **Minimum watch duration**: 10 seconds
2. **Bot detection**: Checks user agent for suspicious patterns
3. **Session validation**: Prevents duplicate views from same session
4. **IP validation**: Basic IP address validation
5. **Time-based validation**: Prevents rapid-fire views

## Redis Caching Strategy

### Temporary View Storage
- **Key format**: `view:{contentType}:{contentId}:{sessionId}`
- **TTL**: 5 minutes
- **Purpose**: Temporary storage during view tracking

### Rate Limiting
- **Key format**: `rate_limit:{action}:{userId}`
- **TTL**: 1 hour
- **Purpose**: Track user action frequency

### Analytics Cache
- **Key format**: `analytics:{contentType}:{contentId}`
- **TTL**: 1 hour
- **Purpose**: Cache computed analytics

### User/Video Data Cache
- **Key format**: `user:{userId}` or `video:{videoId}`
- **TTL**: 30-60 minutes
- **Purpose**: Cache frequently accessed data

## Message Queue Processing

### Queue Structure
- **Video views**: `view_queue:video`
- **Short views**: `view_queue:short`

### Worker Processing
- **Frequency**: Every 5 seconds
- **Validation**: Each view is validated before processing
- **Database update**: Valid views are written to database
- **Analytics update**: View data is sent to analytics service

## Database Schema

The system uses the following tables for engagement tracking:

### View Tables
- `video_views` - Video view tracking
- `short_views` - Short view tracking

### Engagement Tables
- `video_likes` / `short_likes` - Like tracking
- `video_comments` / `short_comments` - Comment system
- `video_shares` / `short_shares` - Share tracking
- `short_bookmarks` - Bookmark system

## Frontend Integration

### View Tracking Service
```typescript
import { viewTrackingService } from './lib/viewTrackingService'

// Start tracking a view
await viewTrackingService.startTracking(videoId, 'videos', userId)

// Track engagement
await viewTrackingService.trackEngagement('like', videoId, 'videos', userId)
await viewTrackingService.trackEngagement('comment', videoId, 'videos', userId, { content: 'Great video!' })
await viewTrackingService.trackEngagement('share', videoId, 'videos', userId, { platform: 'facebook' })
```

### Usage in Components
```typescript
// In video player component
useEffect(() => {
  if (videoRef.current) {
    viewTrackingService.startTracking(videoId, 'videos', userId)
    
    return () => {
      viewTrackingService.stopTracking()
    }
  }
}, [videoId])

// Handle engagement actions
const handleLike = async () => {
  await viewTrackingService.trackEngagement('like', videoId, 'videos', userId)
}
```

## Analytics

### View Analytics
- **Total Views**: Raw view count
- **Unique Views**: Views per unique session
- **Completed Views**: Views where user watched >80% of content
- **Average Watch Duration**: Mean viewing time
- **View Retention**: Percentage of users who continue watching

### Engagement Analytics
- **Engagement Rate**: (Likes + Comments + Shares) / Views
- **Like Rate**: Likes per view
- **Comment Rate**: Comments per view
- **Share Rate**: Shares per view
- **Viral Coefficient**: How many new views each share generates

### User Analytics
- **Watch History**: User's viewing patterns
- **Engagement Score**: User's overall engagement level
- **Favorite Categories**: Most viewed content categories
- **Peak Watching Hours**: When user is most active

## Performance Optimizations

### 1. Database Optimizations
- **Indexes**: On frequently queried fields (userId, contentId, createdAt)
- **Transactions**: For atomic operations (like + count update)
- **Batch processing**: For analytics calculations

### 2. Caching Strategy
- **Redis**: Session data, temporary view counts, rate limits
- **Application Cache**: Frequently accessed user data
- **Analytics Cache**: Computed metrics

### 3. Queue Processing
- **Async Processing**: Non-critical operations (analytics, notifications)
- **Batch Processing**: Bulk updates for performance
- **Error Handling**: Failed message retry logic

## Security Considerations

### 1. Rate Limiting
- **Per-user limits**: Prevents spam and abuse
- **IP-based limits**: Additional protection layer
- **Action-specific limits**: Different limits for different actions

### 2. Bot Detection
- **User Agent Analysis**: Identify automated requests
- **Session Validation**: Prevent fake views
- **IP Analysis**: Detect suspicious patterns

### 3. Content Moderation
- **Comment Filtering**: Remove inappropriate content
- **Spam Detection**: Prevent comment spam
- **User Reporting**: Allow users to report abuse

## Monitoring & Alerting

### Key Metrics
- **Engagement Rate**: (Likes + Comments + Shares) / Views
- **View-to-Completion Rate**: Completed Views / Total Views
- **User Retention**: Users who return after first view
- **Queue Processing Rate**: Views processed per minute
- **Redis Health**: Connection status and performance

### Alerts
- **High engagement drops**: Unusual decrease in engagement
- **Queue backlog**: Views not being processed fast enough
- **Redis failures**: Cache service issues
- **Rate limit violations**: Potential abuse detection

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install redis
```

### 2. Configure Redis
Add to your `.env` file:
```env
REDIS_URL=redis://localhost:6379
```

### 3. Start Redis Server
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 4. Run Database Migrations
```bash
npm run db:migrate
```

### 5. Start the Application
```bash
npm run start
```

The system will automatically:
- Connect to Redis
- Start background workers
- Initialize rate limiting
- Begin processing view queues

## Testing

### API Testing
```bash
# Test view tracking
curl -X POST http://localhost:3001/api/views/videos/test-video-id \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "sessionId": "session-456"}'

# Test rate limiting
curl -X POST http://localhost:3001/api/users/likes/videos \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "videoId": "video-456"}'
```

### Redis Testing
```bash
# Connect to Redis
redis-cli

# Check view queue
LRANGE view_queue:video 0 -1

# Check rate limits
GET rate_limit:like:user-123
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check if Redis server is running
   - Verify REDIS_URL in .env
   - Check firewall settings

2. **Views Not Being Processed**
   - Check worker service status
   - Verify queue items in Redis
   - Check database connection

3. **Rate Limiting Too Aggressive**
   - Adjust limits in redisService.ts
   - Check user activity patterns
   - Monitor for false positives

4. **High Memory Usage**
   - Check Redis memory usage
   - Adjust TTL values
   - Monitor cache hit rates

### Debug Commands
```bash
# Check Redis health
curl http://localhost:3001/api/views/health

# Check worker status
# (Add endpoint to view controller)

# Monitor Redis in real-time
redis-cli monitor
```

## Future Enhancements

1. **Advanced Analytics**
   - Machine learning for content recommendations
   - Predictive analytics for trending content
   - A/B testing framework

2. **Enhanced Security**
   - Advanced bot detection
   - Content fingerprinting
   - Fraud detection algorithms

3. **Performance Improvements**
   - Database sharding
   - CDN integration
   - Microservices architecture

4. **Additional Features**
   - Live engagement metrics
   - Social features (following, notifications)
   - Monetization tracking 