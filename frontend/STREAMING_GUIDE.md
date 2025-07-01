# Hướng dẫn sử dụng chức năng Live Streaming

## Tổng quan

Hệ thống live streaming này cho phép bạn:
- Tạo và quản lý stream keys
- Kết nối với OBS Studio, Streamlabs OBS, YouTube Live, và Facebook Live
- Theo dõi trạng thái stream và số lượng người xem
- Quản lý chat trực tiếp

## Cách sử dụng

### 1. Tạo Stream Key

1. Mở trang **Livestream** trong ứng dụng
2. Trong panel **Stream Management**, click **Create New Key**
3. Nhập tên cho stream key (ví dụ: "My Gaming Stream")
4. Click **Create**

### 2. Kết nối với OBS Studio

#### Cách 1: Sử dụng Setup Guide
1. Chọn stream key bạn muốn sử dụng
2. Click **📖 OBS Setup Guide**
3. Chọn tab **OBS Studio**
4. Copy **Server URL** và **Stream Key**
5. Mở OBS Studio
6. Vào **Settings > Stream**
7. Chọn **Custom** làm service
8. Paste Server URL và Stream Key
9. Click **Apply** và **OK**

#### Cách 2: Download Configuration File
1. Chọn stream key
2. Click **Config** trên stream key
3. Click **OBS Studio** để download file cấu hình
4. Import file vào OBS Studio

### 3. Kết nối với Streamlabs OBS

1. Chọn stream key
2. Click **📖 OBS Setup Guide**
3. Chọn tab **Streamlabs OBS**
4. Copy thông tin kết nối
5. Mở Streamlabs OBS
6. Vào **Settings > Stream**
7. Chọn **Custom RTMP**
8. Paste thông tin và click **Save Settings**

### 4. Kết nối với YouTube Live

1. Chọn stream key
2. Click **📖 OBS Setup Guide**
3. Chọn tab **YouTube Live**
4. Copy **Server URL**
5. Vào YouTube Studio > Go Live
6. Tạo stream mới và copy **Stream Key** từ YouTube
7. Sử dụng Server URL từ hướng dẫn và Stream Key từ YouTube

### 5. Kết nối với Facebook Live

1. Chọn stream key
2. Click **📖 OBS Setup Guide**
3. Chọn tab **Facebook Live**
4. Copy **Server URL**
5. Vào Facebook Live Producer
6. Tạo live video mới và copy **Stream Key** từ Facebook
7. Sử dụng Server URL từ hướng dẫn và Stream Key từ Facebook

## Cài đặt khuyến nghị

### Video Settings
- **Resolution**: 1920x1080 (1080p)
- **FPS**: 30 hoặc 60
- **Bitrate**: 6000 kbps
- **Keyframe Interval**: 2 seconds
- **Encoder**: x264
- **Rate Control**: CBR
- **Preset**: veryfast
- **Profile**: main

### Audio Settings
- **Sample Rate**: 48 kHz
- **Channels**: Stereo
- **Bitrate**: 160 kbps
- **Codec**: AAC

## Quản lý Stream Keys

### Tạo mới
- Click **Create New Key**
- Nhập tên và tạo

### Xóa
- Click **Delete** trên stream key
- Xác nhận xóa

### Regenerate
- Click **Regenerate** để tạo key mới
- Key cũ sẽ bị vô hiệu hóa

### Copy
- Click **Copy** để copy stream key
- Hoặc click **Config** để xem full key

## Theo dõi Stream

### Trạng thái
- **OFFLINE**: Stream chưa bắt đầu
- **LIVE**: Đang phát trực tiếp
- **Viewers**: Số người đang xem
- **Duration**: Thời gian đã phát

### Điều khiển
- **Start Stream**: Bắt đầu stream
- **Stop Stream**: Dừng stream

## Xử lý sự cố

### Kết nối thất bại
1. Kiểm tra kết nối internet
2. Đảm bảo stream key đúng
3. Thử lại

### Stream bị giật
1. Giảm bitrate xuống 4000 kbps
2. Kiểm tra CPU usage
3. Đóng các ứng dụng khác

### Không có âm thanh
1. Kiểm tra audio source trong OBS
2. Đảm bảo audio bitrate đúng
3. Test audio trước khi stream

### Stream key không hoạt động
1. Kiểm tra stream key có đúng không
2. Thử regenerate stream key
3. Đảm bảo stream key chưa hết hạn

## Lưu ý quan trọng

1. **Bảo mật**: Không chia sẻ stream key với người khác
2. **Backup**: Lưu trữ stream keys an toàn
3. **Testing**: Test stream trước khi phát chính thức
4. **Monitoring**: Theo dõi CPU và network usage
5. **Backup Plan**: Có plan B nếu stream bị lỗi

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra hướng dẫn troubleshooting
2. Thử các giải pháp đã đề xuất
3. Liên hệ support nếu cần thiết

---

**Lưu ý**: Hệ thống này sử dụng RTMP server của Reel:
- RTMP Server: `rtmp://localhost:1935/live/`
- HLS Server: `http://localhost:8000/live/`
- Backend API: `http://localhost:3001`

Để khởi động toàn bộ hệ thống:
```bash
cd backend
npm run start
```

Điều này sẽ khởi động cả backend API và RTMP server cùng lúc. 