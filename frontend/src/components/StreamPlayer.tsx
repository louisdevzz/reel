import { useEffect, useRef, useState } from 'react';
import flvjs from 'flv.js';

interface StreamPlayerProps {
  streamKey: string | null;
}

export function StreamPlayer({ streamKey }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let flvPlayer: flvjs.Player | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const initializePlayer = async () => {
      if (!streamKey || !videoRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        if (flvjs.isSupported()) {
          // Use FLV.js
          flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: `http://localhost:8000/live/${streamKey}.flv`,
            hasAudio: true,
            hasVideo: true,
          });

          flvPlayer.attachMediaElement(videoRef.current);
          
          flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
            setIsLoading(false);
            videoRef.current?.play().catch(console.error);
          });

          flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
            console.error('FLV Player Error:', errorType, errorDetail);
            setError('Failed to load FLV stream');
            setIsLoading(false);
            
            // Retry after 3 seconds
            retryTimeout = setTimeout(() => {
              if (flvPlayer) {
                flvPlayer.destroy();
                flvPlayer = null;
              }
              initializePlayer();
            }, 3000);
          });

          flvPlayer.load();
        } else {
          // Fallback to HLS
          const video = videoRef.current;
          video.src = `${process.env.PUBLIC_API_URL}/live/${streamKey}.m3u8`;
          
          const handleCanPlay = () => {
            setIsLoading(false);
            video.play().catch(console.error);
          };

          const handleError = () => {
            console.error('HLS Player Error');
            setError('Failed to load HLS stream');
            setIsLoading(false);
            
            // Retry after 3 seconds
            retryTimeout = setTimeout(() => {
              video.load();
            }, 3000);
          };

          video.addEventListener('canplay', handleCanPlay, { once: true });
          video.addEventListener('error', handleError, { once: true });
          
          video.load();
        }
      } catch (err) {
        console.error('Player initialization error:', err);
        setError('Failed to initialize player');
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializePlayer, 100);

    return () => {
      clearTimeout(timeoutId);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (flvPlayer) {
        flvPlayer.destroy();
      }
    };
  }, [streamKey]);

  if (!streamKey) {
    return <div className="text-gray-400 text-center">Playback not available</div>;
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        style={{ width: '100%', background: 'black' }}
        className="rounded"
      />
    </div>
  );
} 