import NodeMediaServer from 'node-media-server';
import path from 'path';

console.log('🚀 Starting Node Media Server...')

const config = {
    rtmp: {
      port: parseInt('1935', 10),
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: parseInt('8000', 10),
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
      ffmpeg: '/usr/bin/ffmpeg',
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

// Khởi tạo Node Media Server
const nms = new NodeMediaServer(config)

// Handle stream start (postPublish)
nms.on('postPublish', async (stream: any) => {
  
  // Extract stream key from stream name
  const streamKey = stream.streamName;
  console.log(`[NodeMediaServer] Processing stream start for key: ${streamKey}`);
});

// Handle stream end (donePublish)
nms.on('donePublish', async (stream: any) => {
  // Extract stream key from stream name
  const streamKey = stream.streamName;
  console.log(`[NodeMediaServer] Processing stream end for key: ${streamKey}`);
});

nms.run();

console.log(`🚀 RTMP Server is running on rtmp://localhost:${config.rtmp.port}/live/`);
console.log(`🌐 HLS Server is running on http://localhost:${config.http.port}/live/`);
