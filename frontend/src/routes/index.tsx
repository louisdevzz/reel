import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiService } from '../lib/apiService'
import React from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const livestreams = [
  {
    id: 1,
    title: 'NEW⭐️DROPS ON⭐️ ➔ EBR 105 SOLO 3 MARKING',
    streamer: 'German_intelligence',
    game: 'World of Tanks',
    viewers: 795,
    tags: ['WorldofTanks', 'Onslaught', 'DropsEnabled'],
    language: 'en',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_german_intelligence-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/1b1e7e7e-1b1e-4e7e-8e7e-1b1e7e7e1b1e-profile_image-70x70.png',
    isLive: true,
  },
  {
    id: 2,
    title: '2025 NBPL SPRING SPLIT GRAND FINAL TRIOS',
    streamer: 'NARAKABLADEPOINT',
    game: 'NARAKA: BLADEPOINT',
    viewers: 50,
    tags: ['naraka', 'TiếngViệt', 'Vietnamese', 'English'],
    language: 'vi',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_narakabladepoint-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/2b2e7e7e-2b2e-4e7e-8e7e-2b2e7e7e2b2e-profile_image-70x70.png',
    isLive: true,
  },
  {
    id: 3,
    title: '✨Hoy es la actualización✨ZVZ✨DROPS✅✨',
    streamer: 'whithblade',
    game: 'Albion Online',
    viewers: 645,
    tags: ['Español', 'méxico', 'drops', 'DropsActivados'],
    language: 'es',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_whithblade-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/3c3e7e7e-3c3e-4e7e-8e7e-3c3e7e7e3c3e-profile_image-70x70.png',
    isLive: true,
  },
]

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
  type?: 'video' | 'short'
}

function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [shorts, setShorts] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const [videosData, shortsData] = await Promise.all([
          apiService.getVideos(),
          apiService.getShorts()
        ])
        setVideos(videosData)
        setShorts(shortsData)
      } catch (err) {
        setError('Unable to load videos')
        console.error('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const VideoCard = ({ video, isShort = false }: { video: Video; isShort?: boolean }) => {
    // Ref cho video element nếu là short
    const videoRef = isShort ? React.useRef<HTMLVideoElement>(null) : null;

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

    return isShort ? (
      <Link
        to="/s/$videoId"
        params={{ videoId: String(video.id) }}
        className="block"
      >
        <div
          className="bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow group hover:scale-[1.03] transition-transform cursor-pointer"
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
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="p-4">
            {/* <div className="font-semibold text-white mb-2 line-clamp-2">{video.title}</div> */}
            {video.description && (
              <div className="text-sm text-gray-400 mb-2 line-clamp-2">{video.description}</div>
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
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-4">
          <div className="font-semibold text-white mb-2 line-clamp-2">{video.title}</div>
          {video.description && (
            <div className="text-sm text-gray-400 mb-2 line-clamp-2">{video.description}</div>
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
    <div className="min-h-screen bg-[#18181b] text-white pb-20">
      <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-y-auto pb-10">
        {/* Shorts Section */}
        {shorts.length > 0 && (
          <section className="px-4 pt-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">Latest Shorts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {shorts.slice(0, 6).map((short) => (
                  <VideoCard key={short.id} video={short} isShort={true} />
                ))}
              </div>
              {shorts.length > 6 && (
                <div className="text-center mt-6">
                  <button className="text-purple-400 hover:text-purple-300">
                    View more shorts ({shorts.length - 6})
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
                {videos.slice(0, 8).map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
              {videos.length > 8 && (
                <div className="text-center mt-6">
                  <button className="text-purple-400 hover:text-purple-300">
                    View more videos ({videos.length - 8})
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
  )
} 