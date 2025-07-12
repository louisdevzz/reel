import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect, useRef } from 'react';
import { apiService, User } from '../lib/apiService'
import { Triangle } from 'lucide-react'
import * as Player from '@livepeer/react/player';
import { cn } from '../lib/utils';
import { Src } from '@livepeer/react';
import { LoadingIcon } from '@livepeer/react/assets';
import { useUser } from '../contexts/userContext'
import { UserRegistrationDialog } from '../components/UserRegistrationDialog'

export const Route = createFileRoute('/')({
  component: HomePage,
})

interface Video {
  id: string
  title: string
  description?: string
  duration: number
  thumbnail: string
  videoUrl: string
  userId: string
  tags?: string[]
  isPublic: boolean
  uploadDate: string
  views: number
  likes: number
  creator: string
  type?: 'video' | 'short'
}

function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [shorts, setShorts] = useState<Video[]>([])
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllLive, setShowAllLive] = useState(false)
  const [showAllShorts, setShowAllShorts] = useState(false)
  const [showAllVideos, setShowAllVideos] = useState(false)

  // User registration dialog logic
  const { currentUser, account, isConnected, setCurrentUser } = useUser()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (isConnected && !currentUser) {
      setShowDialog(true)
    } else {
      setShowDialog(false)
    }
  }, [isConnected, currentUser])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [videosData, shortsData, liveData] = await Promise.all([
          apiService.getVideos(),
          apiService.getShorts(),
          apiService.getActiveSessions()
        ])
        setVideos(videosData)
        setShorts(shortsData)
        setLiveStreams(liveData)
      } catch (err) {
        setError('Unable to load videos')
        console.error('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }



  const LiveStreamCard = ({ stream }: { stream: any }) => {
    const streamSession = stream.stream_sessions;
    const streamKey = stream.stream_keys?.key || stream.streamKey?.key || stream.streamKey || stream.key;
    const user = stream.users;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snapshotTaken, setSnapshotTaken] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [src, setSrc] = useState<Src[] | null>(null);

    // Get playback URL from API
    useEffect(() => {
      const getPlaybackUrl = async () => {
        if (!streamKey) return;

        setIsLoading(true);
        setError(null);

        try {
          // Try to get playback URL from stream key
          const streamKeyData = await apiService.getStreamKeyByKey(streamKey);
          if (streamKeyData?.playbackUrl) {
            setSrc([{ 
              type: 'hls', 
              src: streamKeyData.playbackUrl as `${string}m3u8`,
              mime: 'application/vnd.apple.mpegurl',
              width: 1920,
              height: 1080
            }]);
            return;
          }

          // If no playback URL in stream key, try to get from stream ID
          if (streamKeyData?.livepeerStreamId) {
            const streamInfo = await apiService.getLivepeerStreamInfo(streamKeyData.livepeerStreamId);
            if (streamInfo?.playbackUrl) {
              setSrc([{ 
                type: 'hls', 
                src: streamInfo.playbackUrl as `${string}m3u8`,
                mime: 'application/vnd.apple.mpegurl',
                width: 1920,
                height: 1080
              }]);
              return;
            }
          }

          // If still no playback URL, try to get from playback ID
          if (streamKeyData?.playbackId) {
            const streamInfo = await apiService.getLivepeerStreamInfoByPlaybackId(streamKeyData.playbackId);
            if (streamInfo?.playbackUrl) {
              setSrc([{ 
                type: 'hls', 
                src: streamInfo.playbackUrl as `${string}m3u8`,
                mime: 'application/vnd.apple.mpegurl',
                width: 1920,
                height: 1080
              }]);
              return;
            }
          }

          setError('No playback URL available');
        } catch (err) {
          console.error('Error getting playback URL:', err);
          setError('Failed to get playback URL');
        } finally {
          setIsLoading(false);
        }
      };

      getPlaybackUrl();
    }, [streamKey]);

    // Capture first frame when video is ready
    useEffect(() => {
      if (!src || !canvasRef.current) return;

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (!snapshotTaken) {
          setError('Video loading timeout');
        }
      }, 10000); // 10 seconds timeout

      return () => {
        clearTimeout(timeoutId);
      };
    }, [src, snapshotTaken]);

    return (
      <Link
        key={streamSession.id}
        to="/live/$username"
        params={{ username: user?.username }}
        className="min-w-[340px] max-w-[340px] bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow group hover:scale-[1.03] transition-transform cursor-pointer relative"
      >
        <div className="relative">
          {src && !error ? (
            <>
              {!snapshotTaken && (
                <div className="w-full h-48 bg-black">
                  <Player.Root 
                    src={src}
                    autoPlay
                  >
                    <Player.Container className="h-full w-full overflow-hidden bg-black outline-none transition rounded">
                      <Player.Video
                         title="Live stream"
                         className={cn("h-full w-full transition")}
                         muted
                         onLoadedData={(e) => {
                          const video = e.currentTarget;
                          if (video.videoWidth > 0 && video.videoHeight > 0 && canvasRef.current) {
                            const canvas = canvasRef.current;
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                              setSnapshotTaken(true);
                              // Pause the video after capturing the frame
                              video.pause();
                            }
                          }
                        }}
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
                    </Player.Container>
                  </Player.Root>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full h-48 object-cover bg-black"
                style={{ display: snapshotTaken ? 'block' : 'none' }}
              />
              {isLoading && !snapshotTaken && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-48 bg-[#27272a] animate-pulse">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800"></div>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-red-600 text-xs font-bold px-2 py-1 rounded text-white z-10">LIVE</span>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-sm font-medium z-10">
            {streamSession.viewerCount >= 1000 ? `${(streamSession.viewerCount / 1000).toFixed(1)}K` : streamSession.viewerCount} viewers
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs text-white">
              <img src={user?.avatar} alt={user?.username} className="w-full h-full rounded-full" />
            </div>
            <div className='flex flex-col'>
              <span className="text-base text-white">
                {streamSession.title || 'No title'}
              </span>
              <span className="text-sm font-semibold text-white line-clamp-1">
                {user?.username || 'Untitled user'}
              </span>
              <div className='flex items-center gap-2 mt-1'>
                {user?.category && (
                  <span className="bg-[#27272a] text-[#a78bfa] px-2 py-0.5 rounded text-xs font-semibold">{user.category}</span>
                )}
                {user?.subCategory && (
                  <span className="bg-[#27272a] text-gray-300 px-2 py-0.5 rounded text-xs">{user.subCategory}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const VideoCard = ({ video, isShort = false }: { video: Video; isShort?: boolean }) => {
    const videoRef = isShort ? React.useRef<HTMLVideoElement>(null) : null;
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(false);
    
    const handleMouseEnter = () => {
      if (isShort && videoRef?.current) {
        videoRef.current.play();
      }
    };
    const handleMouseLeave = () => {
      if (isShort && videoRef?.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    // Fetch user data when component mounts
    useEffect(() => {
      const fetchUserData = async () => {
        if (!video.creator) return;
        
        try {
          setUserLoading(true);
          const userData = await apiService.getUserByUsername(video.creator);
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
        } finally {
          setUserLoading(false);
        }
      };

      fetchUserData();
    }, [video.creator]);

    return isShort ? (
      <Link
        to="/s/$videoId"
        params={{ videoId: String(video.id) }}
        className="block"
      >
        <div
          className="bg-[#18181b] min-h-[280px] rounded-lg overflow-hidden border border-[#27272a] shadow group hover:scale-[1.03] transition-transform cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative">
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-48 object-cover bg-black"
              muted
              playsInline
              preload="metadata"
              style={{ display: 'block' }}
            />
            {/* View count with triangle icon, bottom left */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs bg-black/60 px-2 py-1 rounded text-white font-medium">
              <Triangle size={14} className="text-white rotate-90" />
              {video.views >= 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views}
            </div>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-2">
              {userLoading ? (
                <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
              ) : user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                  {video.creator?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-sm font-semibold text-white mb-1 line-clamp-2">
                {user?.username || video.creator || 'Unknown User'}
              </div>
            </div>
            {(video.description || video.title) && (
              <div className="text-sm tex-gray-300 mb-2 line-clamp-2">{video.description ? video.description.length > 20 ? video.description.slice(0, 20) + '...' : video.description : video.title.length > 20 ? video.title.slice(0, 20) + '...' : video.title}</div>
            )}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="bg-[#27272a] text-xs px-2 py-0.5 rounded text-gray-300">
                    {tag}
                  </span>
                ))}
                {video.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{video.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    ) : (
      <div className="bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow group hover:scale-[1.03] transition-transform cursor-pointer">
        <div className="relative">
          <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
          <span className="absolute top-2 left-2 bg-purple-600 text-xs font-bold px-2 py-1 rounded text-white">
            VIDEO
          </span>
          {/* View count with triangle icon, bottom left */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-sm font-medium">
            <Triangle size={18} className="text-white" fill="white" />
            {video.views >= 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views}
          </div>
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-4">
          <div className="font-semibold text-white mb-2 line-clamp-2">{video.title}</div>
          {(video.description || video.title) && (
              <div className="text-sm tex-gray-300 mb-2 line-clamp-2">{video.description ? video.description.length > 20 ? video.description.slice(0, 20) + '...' : video.description : video.title.length > 20 ? video.title.slice(0, 20) + '...' : video.title}</div>
          )}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-[#27272a] text-xs px-2 py-0.5 rounded text-gray-300">
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{video.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#18181b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <UserRegistrationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onRegistrationComplete={(user) => {
          setCurrentUser(user)
          setShowDialog(false)
        }}
        aptosAddress={account || ''}
      />
      <div className="min-h-screen bg-[#18181b] text-white pb-20">
        <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-y-auto pb-10">
          {/* Live Streams Section */}
          {liveStreams.length > 0 && (
            <section className="px-4 pt-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-red-400">Live channels we think you’ll like</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {(showAllLive ? liveStreams : liveStreams.slice(0, 3)).map((stream: any) => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
                {liveStreams.length > 3 && (
                  <div className="text-center mt-4">
                    <button className="text-purple-400 hover:text-purple-300" onClick={() => setShowAllLive(v => !v)}>
                      {showAllLive ? 'Show less' : `Show more (${liveStreams.length - 3})`}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Shorts Section */}
          {shorts.length > 0 && (
            <section className="px-4 pt-4">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-white">Latest Shorts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(showAllShorts ? shorts : shorts.slice(0, 6)).map((short) => (
                    <VideoCard key={short.id} video={short} isShort={true} />
                  ))}
                </div>
                {shorts.length > 6 && (
                  <div className="text-center mt-6">
                    <button className="text-purple-400 hover:text-purple-300" onClick={() => setShowAllShorts(v => !v)}>
                      {showAllShorts ? 'Show less' : `View more shorts (${shorts.length - 6})`}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Videos Section */}
          {videos.length > 0 && (
            <section className="px-4 pt-12">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-purple-300">Latest Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(showAllVideos ? videos : videos.slice(0, 8)).map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
                {videos.length > 8 && (
                  <div className="text-center mt-6">
                    <button className="text-purple-400 hover:text-purple-300" onClick={() => setShowAllVideos(v => !v)}>
                      {showAllVideos ? 'Show less' : `View more videos (${videos.length - 8})`}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Empty State */}
          {videos.length === 0 && shorts.length === 0 && (
            <section className="px-4 pt-12">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">No videos yet</h2>
                <p className="text-gray-400 mb-6">Be the first to upload a video to the platform!</p>
                <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
                  Upload Video
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
} 