# 🎥 Node Media Server

Node Media Server đơn giản với RTMP và HTTP streaming cho Ubuntu.

## 📋 Yêu cầu hệ thống

- Ubuntu 18.04 trở lên
- FFmpeg
- Bun runtime

## 🚀 Cài đặt

### 1. Cài đặt FFmpeg

```bash
# Cấp quyền thực thi cho script
chmod +x install-ffmpeg.sh

# Chạy script cài đặt FFmpeg
sudo ./install-ffmpeg.sh
```

### 2. Cài đặt Bun (nếu chưa có)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. Cài đặt dependencies

```bash
bun install
```

## 🎯 Sử dụng

### Khởi động server

```bash
# Cấp quyền thực thi cho script
chmod +x start-server.sh

# Khởi động server
./start-server.sh
```

Hoặc chạy trực tiếp:

```bash
bun run start
```

### Cấu hình OBS Studio

1. Mở OBS Studio
2. Vào **Settings** → **Stream**
3. Chọn **Custom** trong **Service**
4. Nhập thông tin:
   - **Server**: `rtmp://localhost:1935/live`
   - **Stream Key**: `[tên stream của bạn]` (ví dụ: `mystream`)

### Xem stream

- **FLV**: `http://localhost:8000/live/[STREAM_KEY].flv`
- **HLS**: `http://localhost:8000/live/[STREAM_KEY]/index.m3u8`

Ví dụ với stream key là `mystream`:
- FLV: `http://localhost:8000/live/mystream.flv`
- HLS: `http://localhost:8000/live/mystream/index.m3u8`

## 🔧 Cấu hình

### Ports

- **RTMP**: 1935 (mặc định)
- **HTTP**: 8000 (mặc định)

### Thay đổi cấu hình

Chỉnh sửa file `index.ts` để thay đổi cấu hình:

```typescript
const config = {
  rtmp: {
    port: 1935,  // Thay đổi port RTMP
    // ...
  },
  http: {
    port: 8000,  // Thay đổi port HTTP
    // ...
  }
};
```

## 🌐 Truy cập từ bên ngoài

Để truy cập từ các thiết bị khác trong mạng:

1. **Mở firewall ports**:
```bash
sudo ufw allow 1935
sudo ufw allow 8000
```

2. **Thay đổi localhost thành IP của server**:
   - RTMP: `rtmp://[IP_SERVER]:1935/live`
   - HTTP: `http://[IP_SERVER]:8000/live/[STREAM_KEY].flv`

## 📝 Logs

Server sẽ hiển thị logs cho các sự kiện:
- Kết nối RTMP
- Bắt đầu/dừng stream
- Xem stream

## 🛑 Dừng server

Nhấn `Ctrl+C` để dừng server an toàn.

## 🔍 Troubleshooting

### FFmpeg không tìm thấy
```bash
# Kiểm tra FFmpeg
ffmpeg -version

# Nếu chưa cài đặt
sudo ./install-ffmpeg.sh
```

### Port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
sudo netstat -tulpn | grep :1935
sudo netstat -tulpn | grep :8000

# Kill process nếu cần
sudo kill -9 [PID]
```

### Không thể stream từ OBS
- Kiểm tra firewall
- Đảm bảo server đang chạy
- Kiểm tra URL và Stream Key
