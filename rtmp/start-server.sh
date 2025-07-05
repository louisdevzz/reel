#!/bin/bash

# Script khởi động Node Media Server trên Ubuntu
# Chạy: ./start-server.sh

echo "🚀 Khởi động Node Media Server..."

curl -fsSL https://bun.sh/install | bash
echo "✅ Bun đã được cài đặt: $(bun --version)"

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
bun install


# Khởi động server
echo "🚀 Khởi động Node Media Server..."
bun run index.ts
echo "💡 Nhấn Ctrl+C để dừng server"
echo ""