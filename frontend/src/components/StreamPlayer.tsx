import React, { useEffect, useState } from 'react';
import { apiService } from '../lib/apiService';
import * as Player from '@livepeer/react/player';
import { cn } from '../lib/utils';
import { Src } from '@livepeer/react';

// Import Livepeer icons
import {
  ClipIcon,
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  LoadingIcon,
  MuteIcon,
  PauseIcon,
  PictureInPictureIcon,
  PlayIcon,
  SettingsIcon,
  UnmuteIcon,
} from '@livepeer/react/assets';

// Import additional icons from lucide-react
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface StreamPlayerProps {
  streamKey: string | null;
  playbackUrl?: string;
  streamId?: string;
  playbackId?: string; // Add support for direct playback ID
}

export function StreamPlayer({ streamKey, playbackUrl, streamId, playbackId }: StreamPlayerProps) {
  const [src, setSrc] = useState<Src[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);

  useEffect(() => {
    const initializePlayer = async () => {
      // Allow initialization with either streamKey or playbackId
      if (!streamKey && !playbackId) return;

      setIsLoading(true);
      setError(null);

      try {
        let finalPlaybackUrl = playbackUrl;

        // If no playback URL provided, try to get it from playback ID first (highest priority)
        if (!finalPlaybackUrl && playbackId) {
          const streamInfo = await apiService.getLivepeerStreamInfoByPlaybackId(playbackId);
          if (streamInfo?.playbackUrl) {
            finalPlaybackUrl = streamInfo.playbackUrl;
          }
        }

        // If still no playback URL, try to get it from stream key
        if (!finalPlaybackUrl && streamKey) {
          const streamKeyData = await apiService.getStreamKeyByKey(streamKey);
          if (streamKeyData?.playbackUrl) {
            finalPlaybackUrl = streamKeyData.playbackUrl;
          }
        }

        // If still no playback URL, try to get from stream ID
        if (!finalPlaybackUrl && streamId) {
          const streamInfo = await apiService.getLivepeerStreamInfo(streamId);
          if (streamInfo?.playbackUrl) {
            finalPlaybackUrl = streamInfo.playbackUrl;
          }
        }



        if (!finalPlaybackUrl) {
          throw new Error('No playback URL available');
        }

        setSrc([{ 
          type: 'hls', 
          src: finalPlaybackUrl as `${string}m3u8`,
          mime: 'application/vnd.apple.mpegurl',
          width: 1920,
          height: 1080
        }]);
        setIsLoading(false);
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
    };
  }, [streamKey, playbackUrl, streamId, playbackId]);

  if (!streamKey && !playbackId) {
    return <div className="text-gray-400 text-center">Playback not available</div>;
  }

  if (isLoading) {
    return (
      <div className="relative h-96 bg-black rounded flex items-center justify-center">
        <div className="text-center">
          <LoadingIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className="relative h-96 bg-black rounded flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-white mb-2">Stream Error</p>
          <p className="text-gray-300 text-sm">{error || 'No playback URL available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Player.Root 
        src={src}
        autoPlay
      >
        <Player.Container className="h-full w-full overflow-hidden bg-black outline-none transition rounded">
          <Player.Video
            title="Live stream"
            className={cn("h-full w-full transition")}
          />

          <Player.LoadingIndicator className="w-full relative h-full bg-black/50 backdrop-blur data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <LoadingIcon className="w-8 h-8 animate-spin" />
            </div>
          </Player.LoadingIndicator>

          <Player.ErrorIndicator
            matcher="all"
            className="absolute select-none inset-0 text-center bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center gap-4 duration-1000 data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="text-lg sm:text-2xl font-bold">Stream Error</div>
                <div className="text-xs sm:text-sm text-gray-100">
                  Unable to load the stream
                </div>
              </div>
            </div>
          </Player.ErrorIndicator>

          <Player.ErrorIndicator
            matcher="offline"
            className="absolute select-none animate-in fade-in-0 inset-0 text-center bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center gap-4 duration-1000 data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="text-lg sm:text-2xl font-bold">
                  Stream is offline
                </div>
                <div className="text-xs sm:text-sm text-gray-100">
                  Playback will start automatically once the stream has started
                </div>
              </div>
              <LoadingIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto animate-spin" />
            </div>
          </Player.ErrorIndicator>

          <Player.ErrorIndicator
            matcher="access-control"
            className="absolute select-none inset-0 text-center bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center gap-4 duration-1000 data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="text-lg sm:text-2xl font-bold">
                  Stream is private
                </div>
                <div className="text-xs sm:text-sm text-gray-100">
                  It looks like you don't have permission to view this content
                </div>
              </div>
            </div>
          </Player.ErrorIndicator>

          <Player.Controls className="bg-gradient-to-b gap-1 px-3 md:px-3 py-2 flex-col-reverse flex from-black/5 via-80% via-black/30 duration-1000 to-black/60 data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0">
            <div className="flex justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <Player.PlayPauseTrigger className="w-6 h-6 hover:scale-110 transition flex-shrink-0">
                  <Player.PlayingIndicator asChild matcher={false}>
                    <PlayIcon className="w-full h-full" />
                  </Player.PlayingIndicator>
                  <Player.PlayingIndicator asChild>
                    <PauseIcon className="w-full h-full" />
                  </Player.PlayingIndicator>
                </Player.PlayPauseTrigger>

                <Player.LiveIndicator className="gap-2 flex items-center">
                  <div className="bg-red-600 h-1.5 w-1.5 rounded-full" />
                  <span className="text-sm select-none">LIVE</span>
                </Player.LiveIndicator>
                <Player.LiveIndicator
                  matcher={false}
                  className="flex gap-2 items-center"
                >
                  <Player.Time className="text-sm tabular-nums select-none" />
                </Player.LiveIndicator>

                <Player.MuteTrigger className="w-6 h-6 hover:scale-110 transition flex-shrink-0">
                  <Player.VolumeIndicator asChild matcher={false}>
                    <MuteIcon className="w-full h-full" />
                  </Player.VolumeIndicator>
                  <Player.VolumeIndicator asChild matcher={true}>
                    <UnmuteIcon className="w-full h-full" />
                  </Player.VolumeIndicator>
                </Player.MuteTrigger>
                <Player.Volume className="relative mr-1 flex-1 group flex cursor-pointer items-center select-none touch-none max-w-[120px] h-5">
                  <Player.Track className="bg-white/30 relative grow rounded-full transition h-[2px] md:h-[3px] group-hover:h-[3px] group-hover:md:h-[4px]">
                    <Player.Range className="absolute bg-white rounded-full h-full" />
                  </Player.Track>
                  <Player.Thumb className="block transition group-hover:scale-110 w-3 h-3 bg-white rounded-full" />
                </Player.Volume>
              </div>
              <div className="flex sm:flex-1 md:flex-[1.5] justify-end items-center gap-2.5">
                <Player.FullscreenIndicator matcher={false} asChild>
                  <Settings className="w-6 h-6 transition flex-shrink-0" />
                </Player.FullscreenIndicator>

                <Player.PictureInPictureTrigger className="w-6 h-6 hover:scale-110 transition flex-shrink-0">
                  <PictureInPictureIcon className="w-full h-full" />
                </Player.PictureInPictureTrigger>

                <Player.FullscreenTrigger className="w-6 h-6 hover:scale-110 transition flex-shrink-0">
                  <Player.FullscreenIndicator asChild>
                    <ExitFullscreenIcon className="w-full h-full" />
                  </Player.FullscreenIndicator>

                  <Player.FullscreenIndicator matcher={false} asChild>
                    <EnterFullscreenIcon className="w-full h-full" />
                  </Player.FullscreenIndicator>
                </Player.FullscreenTrigger>
              </div>
            </div>
            <Player.Seek className="relative group flex cursor-pointer items-center select-none touch-none w-full h-5">
              <Player.Track className="bg-white/30 relative grow rounded-full transition h-[2px] md:h-[3px] group-hover:h-[3px] group-hover:md:h-[4px]">
                <Player.SeekBuffer className="absolute bg-black/30 transition duration-1000 rounded-full h-full" />
                <Player.Range className="absolute bg-white rounded-full h-full" />
              </Player.Track>
              <Player.Thumb className="block transition group-hover:scale-110 w-3 h-3 bg-white rounded-full" />
            </Player.Seek>
          </Player.Controls>
        </Player.Container>
      </Player.Root>
    </div>
  );
}

// Settings component for quality and playback speed controls
const Settings = React.forwardRef(
  (
    { className }: { className?: string },
    ref: React.Ref<HTMLButtonElement> | undefined
  ) => {
    return (
      <Popover.Root>
        <Popover.Trigger ref={ref} asChild>
          <button
            type="button"
            className={className}
            aria-label="Playback settings"
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsIcon />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="w-60 rounded-md bg-black/50 border border-white/50 backdrop-blur-md p-3 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            side="top"
            alignOffset={-70}
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p className="text-white/90 font-medium text-sm mb-1">Settings</p>
              <Player.LiveIndicator
                matcher={false}
                className="gap-2 flex-col flex"
              >
                <label
                  className="text-xs text-white/90 font-medium"
                  htmlFor="speedSelect"
                >
                  Playback speed
                </label>
                <Player.RateSelect name="speedSelect">
                  <Player.SelectTrigger
                    className="inline-flex items-center justify-between rounded-sm px-1 outline-1 outline-white/50 text-xs leading-none h-7 gap-1 outline-none"
                    aria-label="Playback speed"
                  >
                    <Player.SelectValue placeholder="Select a speed..." />
                    <Player.SelectIcon>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Player.SelectIcon>
                  </Player.SelectTrigger>
                  <Player.SelectPortal>
                    <Player.SelectContent className="overflow-hidden bg-black rounded-sm">
                      <Player.SelectViewport className="p-1">
                        <Player.SelectGroup>
                          <RateSelectItem value={0.5}>0.5x</RateSelectItem>
                          <RateSelectItem value={0.75}>0.75x</RateSelectItem>
                          <RateSelectItem value={1}>1x (normal)</RateSelectItem>
                          <RateSelectItem value={1.25}>1.25x</RateSelectItem>
                          <RateSelectItem value={1.5}>1.5x</RateSelectItem>
                          <RateSelectItem value={1.75}>1.75x</RateSelectItem>
                          <RateSelectItem value={2}>2x</RateSelectItem>
                        </Player.SelectGroup>
                      </Player.SelectViewport>
                    </Player.SelectContent>
                  </Player.SelectPortal>
                </Player.RateSelect>
              </Player.LiveIndicator>
              <div className="gap-2 flex-col flex">
                <label
                  className="text-xs text-white/90 font-medium"
                  htmlFor="qualitySelect"
                >
                  Quality
                </label>
                <Player.VideoQualitySelect
                  name="qualitySelect"
                  defaultValue="1.0"
                >
                  <Player.SelectTrigger
                    className="inline-flex items-center justify-between rounded-sm px-1 outline-1 outline-white/50 text-xs leading-none h-7 gap-1 outline-none"
                    aria-label="Playback quality"
                  >
                    <Player.SelectValue placeholder="Select a quality..." />
                    <Player.SelectIcon>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Player.SelectIcon>
                  </Player.SelectTrigger>
                  <Player.SelectPortal>
                    <Player.SelectContent className="overflow-hidden bg-black rounded-sm">
                      <Player.SelectViewport className="p-[5px]">
                        <Player.SelectGroup>
                          <VideoQualitySelectItem value="auto">
                            Auto (HD+)
                          </VideoQualitySelectItem>
                          <VideoQualitySelectItem value="1080p">
                            1080p (HD)
                          </VideoQualitySelectItem>
                          <VideoQualitySelectItem value="720p">
                            720p
                          </VideoQualitySelectItem>
                          <VideoQualitySelectItem value="480p">
                            480p
                          </VideoQualitySelectItem>
                          <VideoQualitySelectItem value="360p">
                            360p
                          </VideoQualitySelectItem>
                        </Player.SelectGroup>
                      </Player.SelectViewport>
                    </Player.SelectContent>
                  </Player.SelectPortal>
                </Player.VideoQualitySelect>
              </div>
            </div>
            <Popover.Close
              className="rounded-full h-5 w-5 inline-flex items-center justify-center absolute top-2.5 right-2.5 outline-none"
              aria-label="Close"
            >
              <XIcon />
            </Popover.Close>
            <Popover.Arrow className="fill-white/50" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

const RateSelectItem = React.forwardRef<
  HTMLDivElement,
  Player.RateSelectItemProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Player.RateSelectItem
      className={cn(
        "text-xs leading-none rounded-sm flex items-center h-7 pr-[35px] pl-[25px] relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-white/20",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Player.SelectItemText>{children}</Player.SelectItemText>
      <Player.SelectItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon className="w-4 h-4" />
      </Player.SelectItemIndicator>
    </Player.RateSelectItem>
  );
});

const VideoQualitySelectItem = React.forwardRef<
  HTMLDivElement,
  Player.VideoQualitySelectItemProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Player.VideoQualitySelectItem
      className={cn(
        "text-xs leading-none rounded-sm flex items-center h-7 pr-[35px] pl-[25px] relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-white/20",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Player.SelectItemText>{children}</Player.SelectItemText>
      <Player.SelectItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon className="w-4 h-4" />
      </Player.SelectItemIndicator>
    </Player.VideoQualitySelectItem>
  );
}); 