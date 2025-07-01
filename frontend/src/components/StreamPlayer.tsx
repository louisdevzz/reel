import { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

interface StreamPlayerProps {
  streamKey: string | null;
}

export function StreamPlayer({ streamKey }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let flvPlayer: flvjs.Player | null = null;

    if (streamKey && videoRef.current && flvjs.isSupported()) {
      flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: `http://localhost:8000/live/${streamKey}.flv`,
      });
      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      flvPlayer.play();
    } else if (streamKey && videoRef.current) {
      // Fallback to HLS if FLV is not supported
      videoRef.current.src = `http://localhost:3001/live/${streamKey}.m3u8`;
    }

    return () => {
      if (flvPlayer) {
        flvPlayer.destroy();
      }
    };
  }, [streamKey]);

  if (!streamKey) {
    return <div className="text-gray-400 text-center">Chọn stream key để xem preview</div>;
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      style={{ width: '100%', background: 'black' }}
      className="rounded"
    />
  );
} 