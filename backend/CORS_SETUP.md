# Cấu hình CORS cho Cloudflare R2 Bucket

## Vấn đề
Video không thể phát được từ frontend do lỗi CORS (Cross-Origin Resource Sharing). R2 bucket trả về Error 403 khi frontend cố gắng truy cập video.

## Giải pháp

### 1. Cấu hình CORS trong Cloudflare Dashboard

1. **Đăng nhập vào Cloudflare Dashboard**
2. **Vào R2 Object Storage**
3. **Chọn bucket của bạn**
4. **Vào Settings > CORS**
5. **Thêm CORS rule mới:**

```json
{
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://yourdomain.com"
  ],
  "AllowedMethods": [
    "GET",
    "HEAD",
    "OPTIONS"
  ],
  "AllowedHeaders": [
    "*"
  ],
  "ExposeHeaders": [
    "ETag",
    "Content-Length",
    "Content-Type",
    "Accept-Ranges"
  ],
  "MaxAgeSeconds": 3600
}
```

### 2. Kiểm tra Public Access

1. **Vào Settings > Public Access**
2. **Đảm bảo "Public Access" được bật**
3. **Kiểm tra "Custom Domain" nếu có**

### 3. Kiểm tra Bucket Policy

1. **Vào Settings > Bucket Policy**
2. **Đảm bảo có policy cho phép public read:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Test sau khi cấu hình

```bash
# Test CORS preflight
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     "https://pub-3fc9ba06a236476a952e34beb065779f.r2.dev/videos/your-video.mp4"

# Test direct access
curl -I "https://pub-3fc9ba06a236476a952e34beb065779f.r2.dev/videos/your-video.mp4"
```

## Giải pháp thay thế: Proxy qua Backend

Nếu không thể cấu hình CORS, có thể tạo proxy endpoint trong backend:

```typescript
// Thêm vào videoRoutes.ts
router.get('/proxy/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const videoUrl = `https://pub-3fc9ba06a236476a952e34beb065779f.r2.dev/videos/${videoId}`;
  
  try {
    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(404).json({ error: 'Video not found' });
  }
});
```

Sau đó thay đổi frontend để sử dụng proxy URL:
```typescript
// Thay vì sử dụng trực tiếp R2 URL
const videoUrl = `http://localhost:3001/api/videos/proxy/${videoId}`;
``` 