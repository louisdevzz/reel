#!/bin/bash

# Script cài đặt FFmpeg trên Ubuntu
# Chạy với quyền sudo: sudo ./install-ffmpeg.sh

echo "🚀 Bắt đầu cài đặt FFmpeg trên Ubuntu..."

sudo apt update
sudo apt install ffmpeg -y

# Kiểm tra phiên bản FFmpeg
echo "✅ Kiểm tra phiên bản FFmpeg..."
ffmpeg -version

echo "🎉 Cài đặt FFmpeg hoàn tất!"
