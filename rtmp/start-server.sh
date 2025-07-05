#!/bin/bash

# Script khởi động Node Media Server trên Ubuntu
# Chạy: ./start-server.sh

echo "🚀 Khởi động Node Media Server..."

# Kiểm tra xem FFmpeg đã được cài đặt chưa
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg chưa được cài đặt!"
    echo "💡 Chạy lệnh sau để cài đặt FFmpeg:"
    echo "   sudo ./install-ffmpeg.sh"
    exit 1
fi

echo "✅ FFmpeg đã được cài đặt: $(ffmpeg -version | head -n1)"

# Kiểm tra xem Bun đã được cài đặt chưa
if ! command -v bun &> /dev/null; then
    echo "❌ Bun chưa được cài đặt!"
    echo "💡 Cài đặt Bun bằng lệnh:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun đã được cài đặt: $(bun --version)"

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
bun install

# Tạo thư mục public nếu chưa có
if [ ! -d "public" ]; then
    echo "📁 Tạo thư mục public..."
    mkdir -p public
fi

# Tạo file HTML đơn giản để test
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node Media Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .success { background-color: #d4edda; color: #155724; }
        .info { background-color: #d1ecf1; color: #0c5460; }
        .warning { background-color: #fff3cd; color: #856404; }
        pre { background-color: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 Node Media Server</h1>
        
        <div class="status success">
            <strong>✅ Server đang chạy!</strong>
        </div>
        
        <h2>📡 Thông tin Server</h2>
        <ul>
            <li><strong>RTMP Server:</strong> rtmp://localhost:1935</li>
            <li><strong>HTTP Server:</strong> http://localhost:8000</li>
        </ul>
        
        <h2>🎥 Cách Stream với OBS</h2>
        <div class="status info">
            <strong>Cấu hình OBS:</strong>
            <ul>
                <li>Stream Type: Custom</li>
                <li>Server: rtmp://localhost:1935/live</li>
                <li>Stream Key: [tên stream của bạn]</li>
            </ul>
        </div>
        
        <h2>📺 Cách Xem Stream</h2>
        <div class="status info">
            <strong>URL xem stream:</strong>
            <ul>
                <li>FLV: http://localhost:8000/live/[STREAM_KEY].flv</li>
                <li>HLS: http://localhost:8000/live/[STREAM_KEY]/index.m3u8</li>
            </ul>
        </div>
        
        <div class="status warning">
            <strong>💡 Lưu ý:</strong> Đảm bảo mở port 1935 và 8000 trong firewall nếu cần truy cập từ bên ngoài.
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Đã tạo file HTML test"

# Khởi động server
echo "🚀 Khởi động Node Media Server..."
echo "💡 Nhấn Ctrl+C để dừng server"
echo ""

bun run start 