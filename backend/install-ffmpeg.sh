#!/bin/bash

# Script cài đặt FFmpeg trên Ubuntu
# Chạy với quyền sudo: sudo ./install-ffmpeg.sh

echo "🚀 Start install ffmpeg..."

sudo apt update
sudo apt install ffmpeg -y

echo "✅ Install ffmpeg success!"
ffmpeg -version