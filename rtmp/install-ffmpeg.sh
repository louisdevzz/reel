#!/bin/bash

# Script cài đặt FFmpeg trên Ubuntu
# Chạy với quyền sudo: sudo ./install-ffmpeg.sh

echo "🚀 Bắt đầu cài đặt FFmpeg trên Ubuntu..."

# Cập nhật package list
echo "📦 Cập nhật package list..."
sudo apt update

# Cài đặt các dependencies cần thiết
echo "🔧 Cài đặt dependencies..."
sudo apt install -y software-properties-common

# Thêm repository FFmpeg chính thức
echo "➕ Thêm FFmpeg repository..."
sudo add-apt-repository ppa:jonathonf/ffmpeg-4 -y

# Cập nhật lại package list sau khi thêm repository
sudo apt update

# Cài đặt FFmpeg
echo "📹 Cài đặt FFmpeg..."
sudo apt install -y ffmpeg

# Cài đặt thêm các codecs cần thiết
echo "🎵 Cài đặt codecs bổ sung..."
sudo apt install -y libavcodec-extra

# Kiểm tra phiên bản FFmpeg
echo "✅ Kiểm tra phiên bản FFmpeg..."
ffmpeg -version

echo "🎉 Cài đặt FFmpeg hoàn tất!"
echo "💡 Để kiểm tra FFmpeg có hoạt động không, chạy: ffmpeg -version" 