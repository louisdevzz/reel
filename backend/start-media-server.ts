import NodeMediaServer from 'node-media-server';
import { streamKeyService } from './src/services/streamKeyService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

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

// // Debug: Log all arguments for event handlers to determine correct signature
// nms.on('preConnect', (...args) => {
//   console.log('[NodeEvent on preConnect] args:', args);
// });
// nms.on('postConnect', (...args) => {
//   console.log('[NodeEvent on postConnect] args:', args);
// });
// nms.on('doneConnect', (...args) => {
//   console.log('[NodeEvent on doneConnect] args:', args);
// });
// nms.on('prePublish', (...args) => {
//   console.log('[NodeEvent on prePublish] args:', args);
// });
// nms.on('postPublish', (session: any, StreamPath, args) => {
//   console.log('[NodeEvent on postPublish]', { session, StreamPath, args });

//   if (session && session.socket) {
//     console.log(`[Stream started] path=${StreamPath}, ip=${session.socket.remoteAddress}`);
//   }
// });
// nms.on('donePublish', (...args) => {
//   console.log('[NodeEvent on donePublish] args:', args);
// });

// // Log lỗi toàn cục
// process.on('uncaughtException', (err) => {
//   console.error('[uncaughtException]', err);
// });
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('[unhandledRejection]', reason);
// });

// Initialize sample stream keys
streamKeyService.initializeSampleData();
console.log('📦 Sample stream keys initialized');

// Debug: List available stream keys
const availableKeys = streamKeyService.getAllStreamKeys();
console.log('🧪 Available stream keys:', availableKeys.map(sk => ({
  name: sk.name,
  key: sk.key,
  isActive: sk.isActive
})));

nms.run();

console.log(`🚀 RTMP Server is running on rtmp://localhost:${config.rtmp.port}/live/`);
console.log(`🌐 HLS Server is running on http://localhost:${config.http.port}/live/`);
