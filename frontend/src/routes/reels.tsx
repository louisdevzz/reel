import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/videos')({
  component: VideosPage,
})

function VideosPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videos = [
    {
      id: 1,
      title: "Web3 Revolution Explained",
      creator: "CryptoCreator",
      description: "Understanding the future of decentralized web",
      views: "12.5K",
      likes: "2.3K",
      comments: "156",
      shares: "89",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=600&fit=crop",
      creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "NFT Art Creation Process",
      creator: "ArtCollector",
      description: "Behind the scenes of digital art creation",
      views: "8.9K",
      likes: "1.7K",
      comments: "234",
      shares: "67",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=600&fit=crop",
      creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      title: "DeFi Yield Farming Guide",
      creator: "DeFiGuru",
      description: "Complete guide to earning passive income",
      views: "15.2K",
      likes: "3.1K",
      comments: "445",
      shares: "123",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=600&fit=crop",
      creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ]

  const currentVideo = videos[currentVideoIndex]

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTip = () => {
    // TODO: Implement tipping functionality with Aptos
    console.log('Tip sent to', currentVideo.creator)
  }

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Liked video', currentVideo.id)
  }

  const handleComment = () => {
    // TODO: Implement comment functionality
    console.log('Comment on video', currentVideo.id)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share video', currentVideo.id)
  }

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    setIsPlaying(false)
  }

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)
    setIsPlaying(false)
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center relative">
      {/* Video Player */}
      <div className="relative w-full h-full max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={currentVideo.thumbnail}
          onClick={handleVideoClick}
          onEnded={nextVideo}
        >
          <source src={currentVideo.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-2">{currentVideo.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{currentVideo.description}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src={currentVideo.creatorAvatar} 
                    alt={currentVideo.creator}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{currentVideo.creator}</span>
                </div>
                <button className="btn-primary text-sm px-4 py-2">
                  Follow
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center space-y-6 ml-4">
              <button 
                onClick={handleLike}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-white text-sm">{currentVideo.likes}</span>
              </button>

              <button 
                onClick={handleComment}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-white text-sm">{currentVideo.comments}</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <span className="text-white text-sm">{currentVideo.shares}</span>
              </button>

              <button 
                onClick={handleTip}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-white text-sm">Tip APT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={prevVideo}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          onClick={nextVideo}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Video Progress */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex space-x-1">
            {videos.map((_, index) => (
              <div 
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index === currentVideoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 