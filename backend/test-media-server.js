import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Cấu hình RTMP và HLS
const RTMP_URL = 'rtmp://localhost:1935/live/test';
const HLS_DIR = path.join(__dirname, 'media', 'live');
const HLS_PLAYLIST = path.join(HLS_DIR, 'test.m3u8');

// Lệnh ffmpeg tạo video testsrc và push lên RTMP
const ffmpegCmd = `ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:sample_rate=44100 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -f flv ${RTMP_URL}`;

console.log('--- Bắt đầu push stream test lên RTMP server ---');
const ffmpegProc = exec(ffmpegCmd, (error, stdout, stderr) => {
  if (error) {
    console.error('Lỗi khi chạy ffmpeg:', error);
    return;
  }
  console.log('ffmpeg stdout:', stdout);
  console.log('ffmpeg stderr:', stderr);
});

// Đợi 30 giây rồi kiểm tra file HLS
setTimeout(() => {
  console.log('--- Kiểm tra file HLS ---');
  if (fs.existsSync(HLS_PLAYLIST)) {
    console.log('✅ Đã tạo file HLS:', HLS_PLAYLIST);
  } else {
    console.error('❌ Không tìm thấy file HLS:', HLS_PLAYLIST);
    // List files in HLS directory for debugging
    try {
      const files = fs.readdirSync(HLS_DIR);
      console.log('📂 Các file hiện có trong thư mục HLS:', files);
    } catch (err) {
      console.error('Lỗi khi đọc thư mục HLS:', err);
    }
  }
  // Dừng ffmpeg
  ffmpegProc.kill();
  process.exit(0);
}, 30000); // 30 seconds 