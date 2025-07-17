import { createFileRoute, useParams } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { apiService } from "../../lib/apiService"
import { viewTrackingService } from "../../lib/viewTrackingService"
import { ThumbsUp, Forward } from "lucide-react" 
import { Video, Comment } from "../../types"
import { useUser } from "../../contexts/userContext"
import { useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute('/v/$videoId')({
  component: VideoPage,
})


function VideoPage() {
  const { videoId } = useParams({ from: '/v/$videoId' })
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [viewTrackingActive, setViewTrackingActive] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [viewStats, setViewStats] = useState<{
    totalViews: number
    uniqueViews: number
    completedViews: number
    averageWatchDuration: number
  } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { currentUser } = useUser()

  // Start view tracking when video loads
  useEffect(() => {
    if (!video || !currentUser?.id) return

    const startTracking = async () => {
      try {
        // Stop previous tracking
        if (viewTrackingActive) {
          await viewTrackingService.stopTracking()
        }

        // Start tracking new video
        const success = await viewTrackingService.startTracking(
          video.id,
          'videos',
          currentUser.id
        )

        if (success) {
          setViewTrackingActive(true)
          // Increment view count when tracking starts (initial view)
          setViewCount(prev => prev + 1)
        }
      } catch (error) {
        console.error('Error starting view tracking:', error)
      }
    }

    startTracking()

    // Cleanup on unmount
    return () => {
      viewTrackingService.stopTracking()
      setViewTrackingActive(false)
    }
  }, [video, currentUser?.id, viewTrackingActive])

  // Track video progress for view analytics
  useEffect(() => {
    const video = videoRef.current
    if (!video || !viewTrackingActive) return

    const handleTimeUpdate = () => {
      const watchDuration = Math.floor(video.currentTime)
      viewTrackingService.updateViewProgress(watchDuration)
      
      // Update view count periodically (every 30 seconds of watching)
      if (watchDuration > 0 && watchDuration % 30 === 0) {
        setViewCount(prev => prev + 1)
        // Update view stats
        if (viewStats) {
          setViewStats(prev => prev ? {
            ...prev,
            totalViews: prev.totalViews + 1,
            averageWatchDuration: Math.round((prev.averageWatchDuration * prev.totalViews + watchDuration) / (prev.totalViews + 1))
          } : null)
        }
      }
    }

    const handleVideoEnded = () => {
      const watchDuration = Math.floor(video.duration)
      viewTrackingService.updateViewProgress(watchDuration, true)
      
      // Increment view count when video is completed
      setViewCount(prev => prev + 1)
      // Update completed views count
      if (viewStats) {
        setViewStats(prev => prev ? {
          ...prev,
          totalViews: prev.totalViews + 1,
          completedViews: prev.completedViews + 1
        } : null)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleVideoEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleVideoEnded)
    }
  }, [viewTrackingActive, viewStats])

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true)
        
        // Fetch video details
        const videoData = await apiService.getVideoById(videoId)
        if (videoData) {
          setVideo(videoData)
          setLikeCount(videoData.likes || 0)
          setFollowersCount(videoData.creatorFollowers || 0)
          setViewCount(videoData.views || 0)
        }

        const commentsData = await apiService.getVideoComments(videoId, 20, 0)
        setComments(commentsData)

        const allVideos = await apiService.getAllVideos(15)
        const filteredVideos = allVideos.filter(v => v.id !== videoId)
        setRelatedVideos(filteredVideos)

        // Check if video is liked by current user
        if (currentUser?.id) {
          const liked = await apiService.isVideoLiked(currentUser.id, videoId)
          setIsLiked(liked)
          
          // Check if user is following the creator
          if (videoData?.userId && videoData.userId !== currentUser.id) {
            const following = await apiService.isFollowing(currentUser.id, videoData.userId)
            setIsFollowing(following)
          }
        }

        // Fetch view statistics
        try {
          const stats = await viewTrackingService.getViewStats(videoId, 'videos')
          if (stats) {
            setViewStats(stats)
            setViewCount(stats.totalViews)
          }
        } catch (error) {
          console.error('Error fetching view stats:', error)
        }

      } catch (error) {
        console.error('Error fetching video data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideoData()
    }
  }, [videoId, currentUser?.id])

  // Set up periodic refresh of view stats
  useEffect(() => {
    if (!videoId) return

    const refreshStats = async () => {
      try {
        const stats = await viewTrackingService.getViewStats(videoId, 'videos')
        if (stats) {
          setViewStats(stats)
          setViewCount(stats.totalViews)
        }
      } catch (error) {
        console.error('Error refreshing view stats:', error)
      }
    }

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(refreshStats, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(statsInterval)
  }, [videoId])

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleLike = async () => {
    if (!currentUser?.id) {
      // Handle user not logged in - could show login prompt
      console.log('User must be logged in to like videos')
      return
    }

    try {
      if (isLiked) {
        // Remove like
        const success = await apiService.removeVideoLike(currentUser.id, videoId)
        if (success) {
          setIsLiked(false)
          setLikeCount(prev => Math.max(0, prev - 1))
        }
      } else {
        // Add like
        const result = await apiService.addVideoLike(currentUser.id, videoId)
        if (result) {
          setIsLiked(true)
          setLikeCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleShare = async (platform: string = 'general') => {
    if (!currentUser?.id) {
      console.log('User must be logged in to share videos')
      return
    }

    try {
      const shareUrl = window.location.href
      const result = await apiService.addVideoShare(videoId, currentUser.id, platform, shareUrl)
      
      if (result) {
        // Try to use native share API if available
        if (navigator.share && platform === 'general') {
          try {
            await navigator.share({
              title: video?.title || 'Check out this video',
              text: video?.description || 'Amazing video content',
              url: shareUrl,
            })
          } catch (shareError) {
            // Fallback to copying to clipboard
            await navigator.clipboard.writeText(shareUrl)
            console.log('Link copied to clipboard')
          }
        } else {
          // Fallback to copying to clipboard
          await navigator.clipboard.writeText(shareUrl)
          console.log('Link copied to clipboard')
        }
      }
    } catch (error) {
      console.error('Error sharing video:', error)
    }
  }

  const handleComment = async () => {
    if (!commentContent.trim()) return

    if (!currentUser?.id) {
      console.log('User must be logged in to comment')
      return
    }

    try {
      const result = await apiService.addVideoComment(videoId, currentUser.id, commentContent)
      
      if (result) {
        // Add the new comment to the local state
        const newComment: Comment = {
          id: result.id || Date.now().toString(),
          content: commentContent,
          userId: currentUser.id,
          videoId: videoId,
          createdAt: new Date().toISOString(),
          user: {
            username: currentUser.username,
            fullName: currentUser.fullName,
            avatar: currentUser.avatar
          }
        }
        
        setComments(prev => [newComment, ...prev])
        setCommentContent("")
        
        // Update video comment count if available
        if (video) {
          setVideo(prev => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null)
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleSubmitComment = async () => {
    await handleComment()
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser?.id) {
      console.log('User must be logged in to delete comments')
      return
    }

    try {
      const success = await apiService.removeVideoComment(commentId, currentUser.id)
      if (success) {
        // Remove comment from local state
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        
        // Update video comment count if available
        if (video) {
          setVideo(prev => prev ? { ...prev, comments: Math.max(0, (prev.comments || 0) - 1) } : null)
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser?.id || !video?.userId || isFollowLoading) {
      console.log('User must be logged in to follow creators or action in progress')
      return
    }

    try {
      setIsFollowLoading(true)
      
      if (isFollowing) {
        // Unfollow user
        const success = await apiService.unfollowUser(currentUser.id, video.userId)
        if (success) {
          setIsFollowing(false)
          setFollowersCount(prev => Math.max(0, prev - 1))
        }
      } else {
        // Follow user
        const result = await apiService.followUser(currentUser.id, video.userId)
        if (result) {
          setIsFollowing(true)
          setFollowersCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error handling follow:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (!hasInteracted) setHasInteracted(true)
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Auto reload video when it ends
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoEnded = () => {
      // Mark view as completed for analytics
      if (viewTrackingActive) {
        const watchDuration = Math.floor(video.duration)
        viewTrackingService.updateViewProgress(watchDuration, true)
      }
      
      video.currentTime = 0
      video.load()
      setIsPlaying(false)
      setHasInteracted(false)
    }

    video.addEventListener('ended', handleVideoEnded)
    return () => video.removeEventListener('ended', handleVideoEnded)
  }, [viewTrackingActive])

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 p-4 bg-zinc-900 min-h-screen">
        <div className="flex-1">
          <div className="w-full aspect-video bg-zinc-800 rounded-lg mb-4 animate-pulse" />
          <div className="h-6 bg-zinc-800 rounded mb-2 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
        </div>
        <aside className="w-full md:w-96 flex-shrink-0">
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-32 h-20 bg-zinc-800 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-zinc-800 rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="flex flex-col md:flex-row gap-6 p-4 bg-zinc-900 min-h-screen">
        <div className="flex-1">
          <div className="w-full aspect-video bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-zinc-400">Video not found</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 bg-zinc-900 min-h-screen">
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-y-auto gap-6">
        <div className="flex-1 w-full mt-2">
          <div className="w-full aspect-video bg-black rounded-lg mb-4 flex items-center justify-center relative">
            <video 
              ref={videoRef}
              src={video.videoUrl} 
              controls 
              controlsList="nodownload"
              className="w-full h-full rounded-lg"
              loop
              autoPlay
              preload="auto"
              onClick={handleVideoClick}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <h1 className="text-xl font-bold text-white mb-2">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden">
                {video.creatorAvatar && (
                  <img src={video.creatorAvatar} alt={video.creatorFullName || video.creator} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="text-white font-semibold">{video.creatorFullName || video.creator || 'Unknown Creator'}</div>
                <div className="text-zinc-400 text-xs">{formatViews(followersCount)} Followers</div>
              </div>
              {
                video.userId !== currentUser?.id && (
                    <button 
                     onClick={handleFollow}
                     disabled={isFollowLoading}
                     className={`ml-4 px-5 py-2 rounded-full font-semibold transition-colors ${
                       isFollowLoading
                         ? 'bg-zinc-500 text-zinc-300 cursor-not-allowed'
                         : isFollowing 
                           ? 'bg-zinc-600 text-white hover:bg-red-600 hover:text-white' 
                           : 'bg-white bg-opacity-90 text-black hover:bg-opacity-100'
                     }`}
                   >
                     {isFollowLoading ? (
                       <span className="flex items-center gap-2">
                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                         {isFollowing ? 'Unfollowing...' : 'Following...'}
                       </span>
                     ) : isFollowing ? (
                       <span className="group">
                         <span className="group-hover:hidden">Following</span>
                         <span className="hidden group-hover:inline">Unfollow</span>
                       </span>
                     ) : (
                       'Follow'
                     )}
                   </button>
                )
              }
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {
                video.userId !== currentUser?.id && (
                  <button 
                    onClick={handleLike}
                    className={`px-5 py-2 rounded-full flex items-center gap-1 transition-colors ${isLiked ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20' : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'}`}
                  > 
                    <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}/>
                    <span>{formatViews(likeCount)}</span>
                  </button>
                )
              }
              <button 
                onClick={() => handleShare()}
                className="px-5 py-2 bg-white bg-opacity-10 text-white rounded-full flex items-center gap-1 hover:bg-white hover:bg-opacity-20"
              >
                <Forward className="w-5 h-5"/>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-3 text-zinc-200 mb-4">
            <div className="mb-1 font-semibold">{formatViews(viewCount)} views • {formatDate(video.uploadDate)}</div>
            {viewStats && (
              <div className="text-sm text-zinc-400 mb-2">
                {formatViews(viewStats.uniqueViews)} unique views • {formatViews(viewStats.completedViews)} completed • 
                Avg watch time: {formatDuration(viewStats.averageWatchDuration)}
              </div>
            )}
            <div>{video.description}</div>
          </div>
          
          <div className="p-2 text-zinc-200 mt-4 pb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-bold">{video.comments} comments</div>
            </div>
            
            <div className="flex items-start gap-3 mb-6">
              <img src={video.creatorAvatar} alt="avatar" className="w-10 h-10 rounded-full" />
              <div className="flex-1 flex gap-2">
                <input 
                  className="flex-1 bg-transparent border-b border-zinc-600 focus:outline-none focus:border-zinc-400 text-white py-2" 
                  placeholder="Write a comment..." 
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.user.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">@{comment.user.username}</span>
                      <span className="text-zinc-400 text-xs">{formatDate(comment.createdAt)}</span>
                    </div>
                    <div className="mb-2">{comment.content}</div>
                  </div>
                  {comment.userId === currentUser?.id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-zinc-400 hover:text-red-500 self-start transition-colors"
                      title="Delete comment"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path 
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" 
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <aside className="w-full md:w-96 flex-shrink-0 mt-1">
          <div className="flex flex-col gap-4">
            {relatedVideos.map((relatedVideo) => (
              <div 
                key={relatedVideo.id} 
                className="flex gap-3 cursor-pointer hover:bg-zinc-800 rounded p-2"
                onClick={()=>navigate({to: '/v/$videoId', params: {videoId: relatedVideo.id}})}
              >
                <div className="w-32 h-20 bg-zinc-700 rounded overflow-hidden relative">
                  <video
                    src={relatedVideo.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                </div>
                <div className="flex-1 flex-col flex gap-1">
                  <span className="text-white font-semibold text-sm">{relatedVideo.title.length > 100 ? relatedVideo.title.slice(0, 100) + '...' : relatedVideo.title}</span>
                  <span className="text-zinc-400 text-sm">{relatedVideo.creatorFullName || relatedVideo.creator}</span>
                  <span className="text-xs text-zinc-400">{formatViews(relatedVideo.views)} views • {formatDate(relatedVideo.uploadDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}