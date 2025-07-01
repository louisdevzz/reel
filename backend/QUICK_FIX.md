# Quick Fix for "authentication verification failed" Error

## Problem
When you try to start streaming in OBS, you get this error:
```
[ERROR] RTMP session xxx push /live/streamkey error, publish stream /live/streamkey authentication verification failed
```

## Immediate Solutions

### 1. Check Stream Key Status
1. Open your frontend application
2. Go to the Livestream page
3. Check if your stream key shows as "Active" (green badge)
4. If not active, click "Activate" button

### 2. Verify Stream Key
1. Copy the stream key from frontend
2. In OBS: Settings → Stream
3. Make sure you pasted the ENTIRE stream key (32 characters)
4. No extra spaces before or after

### 3. Restart Services
```bash
# Stop current services (Ctrl+C)
# Then restart:
cd backend
npm run start
```

### 4. Test Stream Key
```bash
cd backend
npm run test:keys
```
This will show you all available stream keys and their status.

### 5. Check OBS Configuration
- **Service**: Custom
- **Server**: `rtmp://localhost:1935/live/`
- **Stream Key**: [your 32-character stream key]

## If Still Not Working

1. **Create a new stream key** in the frontend
2. **Check backend logs** for detailed error messages
3. **Verify ports**: 3001 (API), 1935 (RTMP), 8000 (HLS)
4. **Check firewall** - make sure ports aren't blocked

## Common Mistakes
- ❌ Using wrong server URL
- ❌ Incomplete stream key copy
- ❌ Stream key is inactive
- ❌ Backend services not running
- ❌ Wrong port numbers

## Success Indicators
- ✅ Stream key shows "Active" in frontend
- ✅ Backend logs show "Stream key validation passed"
- ✅ OBS shows "Connected" status
- ✅ No authentication errors in logs 