# Streaming Setup Guide

## Overview
This guide will help you set up streaming with OBS Studio and troubleshoot common authentication issues.

## Prerequisites
1. Backend server running on `http://localhost:3001`
2. Media server running on `rtmp://localhost:1935/live/`
3. Frontend application running
4. OBS Studio installed

## Step-by-Step Setup

### 1. Start the Backend Services
```bash
cd backend
npm run start
```

This will start both the API server and the RTMP media server concurrently.

### 2. Create a Stream Key
1. Open the frontend application
2. Navigate to the Livestream page
3. Click "Create New Key" in the Stream Management panel
4. Give your stream key a name (e.g., "My First Stream")
5. Copy the generated stream key

### 3. Configure OBS Studio
1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. Set the following:
   - **Service**: Custom
   - **Server**: `rtmp://localhost:1935/live/`
   - **Stream Key**: Paste your stream key here

### 4. Start Streaming
1. In OBS Studio, click **Start Streaming**
2. In the frontend, select your stream key and click **Start Stream**
3. Your stream should now be live!

## Troubleshooting

### Authentication Error: "authentication verification failed"

This error occurs when the stream key is not found or is inactive. Here's how to fix it:

#### Check Stream Key Status
1. In the frontend, verify that your stream key is marked as "Active"
2. If it shows as inactive, click the "Activate" button

#### Verify Stream Key Format
- Stream keys are 32 characters long
- They contain letters and numbers
- Make sure you copied the entire key without extra spaces

#### Check Backend Connection
1. Ensure the backend server is running: `http://localhost:3001`
2. Check that the media server is running: `rtmp://localhost:1935/live/`
3. Verify both services started without errors

#### Common Issues and Solutions

**Issue**: "Stream key not found"
- **Solution**: Create a new stream key in the frontend

**Issue**: "Stream key is inactive"
- **Solution**: Activate the stream key in the frontend

**Issue**: Backend connection failed
- **Solution**: Restart the backend server with `npm run start`

**Issue**: RTMP server not responding
- **Solution**: Check if port 1935 is available and restart the media server

### Manual Stream Key Validation

If you're still having issues, you can manually validate your stream key:

1. Open your browser and go to: `http://localhost:3001/api/stream-keys`
2. Look for your stream key in the response
3. Verify that `isActive` is `true`

### Testing Stream Key

You can test your stream key using FFmpeg:

```bash
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=10 -c:v libx264 -c:a aac -f flv rtmp://localhost:1935/live/YOUR_STREAM_KEY
```

Replace `YOUR_STREAM_KEY` with your actual stream key.

## Advanced Configuration

### OBS Recommended Settings
- **Encoder**: x264
- **Rate Control**: CBR
- **Bitrate**: 6000 kbps
- **Keyframe Interval**: 2 seconds
- **Preset**: veryfast
- **Profile**: main

### Network Configuration
- **Server**: rtmp://localhost:1935/live/
- **Use Authentication**: No (handled by stream key)
- **Low Latency Mode**: Enabled (if available)

## Monitoring

### Check Stream Status
- Frontend dashboard shows live status
- Backend logs show authentication attempts
- Media server logs show RTMP connections

### Logs Location
- Backend logs: Terminal where you ran `npm run start`
- Media server logs: Same terminal (RTMP events)

## Support

If you continue to experience issues:

1. Check the backend logs for detailed error messages
2. Verify all services are running on the correct ports
3. Ensure no firewall is blocking the connections
4. Try creating a new stream key

## Port Configuration

Default ports used:
- **API Server**: 3001
- **RTMP Server**: 1935
- **HLS Server**: 8000
- **Frontend**: 5173 (Vite default)

Make sure these ports are not used by other applications. 