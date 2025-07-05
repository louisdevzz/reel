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
const nms = new NodeMediaServer(config);

// Event handlers cho Node Media Server
nms.on('preConnect', (id: any, args: any) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id: any, args: any) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id: any, args: any) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPublish', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPlay', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id: any, StreamPath: any, args: any) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// Khởi động server
const startServer = () => {
  try {
    // Khởi động Node Media Server
    nms.run();
    console.log('🚀 Node Media Server đã khởi động:');
    console.log(`   RTMP Server: rtmp://localhost:${config.rtmp.port}`);
    console.log(`   HTTP Server: http://localhost:${config.http.port}`);
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
};

// Xử lý tín hiệu tắt
process.on('SIGINT', () => {
  console.log('\n🛑 Đang tắt server...');
  nms.stop();
  console.log('✅ Server đã tắt thành công');
  process.exit(0);
});

// Khởi động server
startServer();