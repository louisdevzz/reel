#!/bin/bash

# Script khởi động Node Media Server trên Ubuntu
# Chạy: ./start-server.sh

echo "🚀 Start install ffmpeg..."
chmod +x install-ffmpeg.sh
./install-ffmpeg.sh
echo "✅ Install ffmpeg success!"

echo "🚀 Start install bun..."
curl -fsSL https://bun.sh/install | bash
echo "✅ Bun install success!"

echo "🚀 Start install dependencies..."
bun install
echo "✅ Install dependencies success!"

echo "🚀 Start server..."
bun run start

