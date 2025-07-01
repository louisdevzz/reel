# 🔍 Stream Key Debug Guide

## ✅ Các cải tiến đã thực hiện

### 1. Cải thiện `getStreamKeyByKey()` method
- ✅ Thêm `trim()` để loại bỏ khoảng trắng
- ✅ Xử lý `null/undefined` keys
- ✅ Thêm debug logging chi tiết

### 2. Cải thiện `prePublish` event handler
- ✅ Log chi tiết stream key nhận được
- ✅ So sánh trực tiếp với danh sách keys
- ✅ Hiển thị tất cả available keys
- ✅ Hướng dẫn OBS setup

## 🧪 Cách debug khi gặp lỗi

### Bước 1: Kiểm tra log server
Khi OBS cố gắng stream, bạn sẽ thấy log như sau:

```
📺 Attempting to publish with stream key: [YOUR_KEY]
🔍 Stream key type: string
🔍 Stream key length: 32
🔍 Stream key trimmed: [YOUR_KEY_TRIMMED]

📋 All available stream keys:
  1. "vK1YaFwOVQPDZk1KilwldK37A93PmCA7" (Main Stream) - Active: true
  2. "z0g78bhrHjUHplx5Ji6jbashHYs3ZUZs" (Test Stream) - Active: false
  3. "ZVte6PO5W0YNoVeJp8bry8k3mJcwQxos" (Backup Stream) - Active: true

🔍 Direct match result: ✅ Found: Main Stream
🔍 Trimmed match result: ✅ Found: Main Stream
```

### Bước 2: So sánh stream key
- **Nếu `Direct match` = ❌ Not found**: Stream key trong OBS không khớp chính xác
- **Nếu `Trimmed match` = ✅ Found**: Có khoảng trắng trong stream key
- **Nếu cả hai = ❌ Not found**: Stream key hoàn toàn sai

### Bước 3: Kiểm tra OBS Settings
Trong OBS Studio:
1. **Settings > Stream**
2. **Service**: Custom
3. **Server**: `rtmp://localhost:1935/live/`
4. **Stream Key**: Copy-paste chính xác từ log server

## 🎯 Stream Keys hiện có

| Name | Key | Status |
|------|-----|--------|
| Main Stream | `vK1YaFwOVQPDZk1KilwldK37A93PmCA7` | ✅ Active |
| Test Stream | `z0g78bhrHjUHplx5Ji6jbashHYs3ZUZs` | ❌ Inactive |
| Backup Stream | `ZVte6PO5W0YNoVeJp8bry8k3mJcwQxos` | ✅ Active |

## 🚨 Các lỗi thường gặp

### 1. "Stream key not found"
**Nguyên nhân:**
- Copy-paste sai stream key
- Có khoảng trắng thừa
- Gõ sai ký tự

**Giải pháp:**
- Copy stream key từ log server
- Paste vào OBS
- Kiểm tra không có khoảng trắng

### 2. "Stream key is inactive"
**Nguyên nhân:**
- Stream key bị deactivate
- Dùng Test Stream key

**Giải pháp:**
- Dùng Main Stream hoặc Backup Stream
- Hoặc activate lại Test Stream

### 3. "Connection failed"
**Nguyên nhân:**
- Server chưa chạy
- Port bị block
- Firewall

**Giải pháp:**
- Kiểm tra server đang chạy: `bun run start-media-server.ts`
- Kiểm tra port 1935 không bị block
- Tắt firewall tạm thời

## 🧪 Test script

Chạy test để kiểm tra logic:

```bash
cd backend
bun run test-stream-key.js
```

## 📝 Checklist khi setup OBS

- [ ] Server URL: `rtmp://localhost:1935/live/`
- [ ] Stream Key: Copy từ log server (không tự gõ)
- [ ] Không có khoảng trắng trong stream key
- [ ] Server đang chạy
- [ ] Stream key đang active

## 🔧 Các lệnh hữu ích

```bash
# Khởi động server
bun run start-media-server.ts

# Test stream key logic
bun run test-stream-key.js

# Xem log real-time
tail -f logs/media-server.log
``` 