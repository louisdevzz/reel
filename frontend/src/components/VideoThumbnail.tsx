import { Link } from '@tanstack/react-router';
import React, { useRef, useState, useEffect } from 'react';

interface VideoThumbnailProps {
  videoUrl: string;
  title: string;
  duration?: number;
  className?: string;
  showDuration?: boolean;
  onDuration?: (duration: number) => void;
  fallbackThumbnail?: string;
  videoId: string;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  title,
  duration,
  className = "",
  showDuration = true,
  onDuration,
  fallbackThumbnail,
  videoId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentDuration, setCurrentDuration] = useState(duration || 0);
  const [hasError, setHasError] = useState(false);

  // Check if videoUrl is valid
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {fallbackThumbnail ? (
          <img 
            src={fallbackThumbnail} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-white text-sm text-center">
              <div className="mb-2">🎬</div>
              <div>No video URL</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleMouseEnter = () => {
    if (videoRef?.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef?.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = Math.round(video.duration);
      setCurrentDuration(videoDuration);
      if (onDuration) {
        onDuration(videoDuration);
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setHasError(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [onDuration, videoUrl]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Link
      className={`relative overflow-hidden ${className} cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      to="/s/$videoId"
      params={{ videoId: videoId }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover bg-black"
        muted
        playsInline
        preload="metadata"
        style={{ display: 'block' }}
      />
      
      {showDuration && currentDuration > 0 && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
          {formatDuration(currentDuration)}
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          {fallbackThumbnail ? (
            <img 
              src={fallbackThumbnail} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-sm text-center">
              <div className="mb-2">🎬</div>
              <div>Video unavailable</div>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}; 