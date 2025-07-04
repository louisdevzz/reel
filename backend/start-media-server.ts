import NodeMediaServer from 'node-media-server';
import { streamKeyService } from './src/services/streamKeyService';
import { streamSessionService } from './src/services/streamSessionService';
import { websocketService } from './src/services/websocketService';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config();

console.log('[NodeMediaServer] Starting media server...');

const config = {
  rtmp: {
    port: parseInt(process.env.NMS_RTMP_PORT || '1935', 10),
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: parseInt(process.env.NMS_HTTP_PORT || '8000', 10),
    allow_origin: '*',
    mediaroot: path.join(__dirname, 'media'),
    api: true, // Enable NMS API and HTTP-FLV playback
    // HTTP-FLV is available at http://localhost:8000/live/{streamKey}.flv
  },
  static: {
    router: '/',
    root: path.join(__dirname, 'media'),
  },
  record: {
    path: path.join(__dirname, 'media/record'),
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'admin',
    play: false,
    publish: false, // Disable built-in authentication, use custom logic
    secret: 'nodemedia2017secretstring',
  },
  trans: {
    ffmpeg: '/opt/homebrew/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: true,
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
      },
    ],
  },
};

const nms = new NodeMediaServer(config);


// Handle stream start (postPublish)
nms.on('postPublish', async (stream: any) => {
  
  // Extract stream key from stream name
  const streamKey = stream.streamName;
  if (streamKey) {
    try {
      console.log(`[NodeMediaServer] Processing stream start for key: ${streamKey}`);
      
      // First, get stream key data to ensure it exists
      const streamKeyData = await streamKeyService.getStreamKeyByKey(streamKey);
      if (!streamKeyData) {
        return;
      }
    
      await streamSessionService.updateStreamKeyLiveStatus(streamKey, true);
      
      // Broadcast status update to WebSocket clients
      console.log(`[NodeMediaServer] Broadcasting status update for ${streamKey}`);
      await websocketService.broadcastStatusUpdate(streamKey);
      
      console.log(`[NodeMediaServer] Stream started successfully for key: ${streamKey}`);
    } catch (error) {
      console.error('[NodeMediaServer] Error handling postPublish:', error);
      console.error('[NodeMediaServer] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  }
});

// Handle stream end (donePublish)
nms.on('donePublish', async (stream: any) => {
  // Extract stream key from stream name
  const streamKey = stream.streamName;
  if (streamKey) {
    try {
      console.log(`[NodeMediaServer] Processing stream end for key: ${streamKey}`);
      
      // Update stream key to isLive = false
      await streamSessionService.updateStreamKeyLiveStatus(streamKey, false);
      
      // Stop the current live session if exists
      const liveSession = await streamSessionService.getLiveSessionByStreamKey(streamKey);
      if (liveSession && liveSession.stream_sessions && liveSession.stream_sessions.id) {
        await streamSessionService.stopSession(liveSession.stream_sessions.id);
        console.log(`[NodeMediaServer] Stopped live session for stream key: ${streamKey}`);
      } else if (liveSession && liveSession.id) {
        await streamSessionService.stopSession(liveSession.id);
        console.log(`[NodeMediaServer] Stopped live session for stream key: ${streamKey}`);
      }
      
      await websocketService.broadcastStatusUpdate(streamKey);
    } catch (error) {
      console.error('[NodeMediaServer] Error handling donePublish:', error);
    }
  }
});

nms.run();

console.log(`🚀 RTMP Server is running on rtmp://localhost:${config.rtmp.port}/live/`);
console.log(`🌐 HLS Server is running on http://localhost:${config.http.port}/live/`);
