# RTMP Server Setup for Reel

## Overview
Reel now includes its own RTMP server for live streaming. The RTMP server runs on port 1935 and provides HLS streaming on port 8000.

## Server URLs

### RTMP Server
- **URL**: `rtmp://localhost:1935/live/`
- **Port**: 1935
- **Application**: live

### HLS Server (for playback)
- **URL**: `http://localhost:8000/live/`
- **Port**: 8000

## Starting the Servers

### Option 1: Start both servers together
```bash
npm run start
```

### Option 2: Start servers separately
```bash
# Terminal 1 - Backend API
npm run dev

# Terminal 2 - RTMP Server
npm run rtmp
```

## Stream Key Format
When creating a stream key in the dashboard, use it with the RTMP URL like this:
```
rtmp://localhost:1935/live/YOUR_STREAM_KEY
```

## OBS Studio Configuration
1. Open OBS Studio
2. Go to Settings > Stream
3. Select "Custom" as the service
4. Server: `rtmp://localhost:1935/live/`
5. Stream Key: Your generated stream key
6. Click "Apply" and "OK"

## Streamlabs OBS Configuration
1. Open Streamlabs OBS
2. Go to Settings > Stream
3. Select "Custom RTMP" as the service
4. Server: `rtmp://localhost:1935/live/`
5. Stream Key: Your generated stream key
6. Click "Save Settings"

## Recommended Settings
- **Video**: 1920x1080, 30fps, 6000 kbps
- **Audio**: 48kHz, Stereo, 160 kbps AAC
- **Keyframe Interval**: 2 seconds

## Troubleshooting
- Make sure ports 1935 and 8000 are not in use
- Check firewall settings
- Ensure FFmpeg is installed for transcoding (optional)
- Verify stream keys are valid and not expired

## Development Notes
- The RTMP server automatically creates HLS streams for web playback
- Streams are stored in the `media/live/` directory
- Logs show connection and publishing events 