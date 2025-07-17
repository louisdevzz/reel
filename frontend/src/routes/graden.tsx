import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { apiService } from '../lib/apiService'
import { viewTrackingService } from '../lib/viewTrackingService'
import { useUser } from '../contexts/userContext'
import { CommentSection } from '../components/CommentSection'
import { Plus } from 'lucide-react'
import { relayerService } from '../lib/relayerService'
import { toast } from 'react-hot-toast'
import { PetFeed } from '../components/PetFeed'


export const Route = createFileRoute('/graden')({
  component: GradenPage,
})

function GradenPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [preloadedVideoElements, setPreloadedVideoElements] = useState<{[id: string]: HTMLVideoElement | null}>({})

  const { currentUser } = useUser()
  const currentUserId = currentUser?.id
  const [engagementStates, setEngagementStates] = useState<{[videoId: string]: {
    isLiked: boolean
    isBookmarked: boolean
    likeCount: number
    commentCount: number
    shareCount: number
    bookmarkCount: number
  }}>({})
  const [viewTrackingActive, setViewTrackingActive] = useState(false)
  const [comments, setComments] = useState<{[videoId: string]: any[]}>({})
  const [commentsLoading, setCommentsLoading] = useState<{[videoId: string]: boolean}>({})
  const [isFollowing, setIsFollowing] = useState(false)

  const LIMIT = 20

  // Fetch initial videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const allShorts = await apiService.getShortsWithPagination(LIMIT, 0)
        setVideos(allShorts)
        setHasMore(allShorts.length === LIMIT)
      } catch (err) {
        setError('Failed to load videos')
        console.error('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  // Fetch more videos when near end
  useEffect(() => {
    if (!hasMore || fetchingMore) return
    if (videos.length - currentIndex <= 3) {
      setFetchingMore(true)
      apiService.getShortsWithPagination(LIMIT, videos.length)
        .then(newVideos => {
          if (newVideos.length > 0) {
            setVideos(prev => [...prev, ...newVideos])
            setHasMore(newVideos.length === LIMIT)
          } else {
            setHasMore(false)
          }
        })
        .catch(err => {
          setError('Failed to load more videos')
        })
        .finally(() => setFetchingMore(false))
    }
  }, [currentIndex, videos, hasMore, fetchingMore])

  // Update document title
  useEffect(() => {
    const currentVideo = videos[currentIndex];
    if (currentVideo) {
      const title = currentVideo.title || 'Untitled Video';
      const creator = currentVideo.creator || 'Unknown Creator';
      document.title = `${title} | ${creator} - Reel`;
    } else {
      document.title = `Reel – A Decentralized SocialFi Platform for Video and Livestreaming`;
    }
    return () => {
      document.title = "Reel – A Decentralized SocialFi Platform for Video and Livestreaming";
    };
  }, [videos, currentIndex]);

  // Engagement states (like, bookmark, ...)
  useEffect(() => {
    if (!currentUserId || videos.length === 0) return;
    const indicesToCheck = [currentIndex];
    if (currentIndex > 0) indicesToCheck.push(currentIndex - 1);
    if (currentIndex < videos.length - 1) indicesToCheck.push(currentIndex + 1);
    const states: {[videoId: string]: any} = {};
    for (const video of videos) {
      states[video.id] = {
        isLiked: false,
        isBookmarked: false,
        likeCount: video.likes || 0,
        commentCount: video.comments || 0,
        shareCount: video.shares || 0,
        bookmarkCount: video.bookmarks || 0
      };
    }
    setEngagementStates(states);
    indicesToCheck.forEach(async (idx) => {
      const video = videos[idx];
      if (!video) return;
      try {
        const [isLiked, isBookmarked] = await Promise.all([
          apiService.isShortLiked(currentUserId, video.id),
          apiService.isShortBookmarked(currentUserId, video.id)
        ]);
        setEngagementStates(prev => ({
          ...prev,
          [video.id]: {
            ...prev[video.id],
            isLiked,
            isBookmarked
          }
        }));
      } catch (error) {}
    });
  }, [currentUserId, videos, currentIndex]);

  // View tracking
  useEffect(() => {
    const currentVideo = videos[currentIndex]
    if (!currentVideo || !currentUserId) return
    const startTracking = async () => {
      try {
        if (viewTrackingActive) {
          await viewTrackingService.stopTracking()
        }
        const success = await viewTrackingService.startTracking(
          currentVideo.id,
          'shorts',
          currentUserId
        )
        if (success) {
          setViewTrackingActive(true)
        }
      } catch (error) {
        console.error('Error starting view tracking:', error)
      }
    }
    startTracking()
    return () => {
      viewTrackingService.stopTracking()
      setViewTrackingActive(false)
    }
  }, [currentIndex, videos, currentUserId, viewTrackingActive])

  // Preload next/prev videos
  const preloadVideoElement = useCallback((videoId: string) => {
    if (!videoId || preloadedVideoElements[videoId]) return;
    const video = document.createElement('video');
    video.src = `${process.env.PUBLIC_API_URL}/api/videos/proxy/${videoId}`;
    video.preload = 'auto';
    video.muted = true;
    video.style.display = 'none';
    document.body.appendChild(video);
    setPreloadedVideoElements(prev => ({ ...prev, [videoId]: video }));
  }, [preloadedVideoElements]);
  useEffect(() => {
    if (videos.length === 0) return;
    const nextIndex = (currentIndex + 1) % videos.length;
    const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
    preloadVideoElement(videos[nextIndex]?.id);
    preloadVideoElement(videos[prevIndex]?.id);
  }, [currentIndex, videos, preloadVideoElement]);
  useEffect(() => {
    const currentId = videos[currentIndex]?.id;
    if (!currentId || !videoRef.current) return;
    const preloaded = preloadedVideoElements[currentId];
    if (preloaded && preloaded.readyState >= 2) {
      videoRef.current.src = preloaded.src;
    } else {
      videoRef.current.src = `${process.env.PUBLIC_API_URL}/api/videos/proxy/${currentId}`;
    }
    setHasInteracted(false);
    // setIsPlaying(false); // Optionally reset play state
  }, [currentIndex, videos, preloadedVideoElements]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        nextVideo()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        previousVideo()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleVideoClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, videos.length, showComments])

  // Handle scroll navigation
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isScrolling) return
      clearTimeout(scrollTimeout)
      setIsScrolling(true)
      if (e.deltaY > 0) {
        nextVideo()
      } else if (e.deltaY < 0) {
        previousVideo()
      }
      scrollTimeout = setTimeout(() => setIsScrolling(false), 300)
    }
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const startY = touch.clientY
      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0]
        const endY = touch.clientY
        const deltaY = startY - endY
        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0) {
            nextVideo()
          } else {
            previousVideo()
          }
        }
        document.removeEventListener('touchend', handleTouchEnd)
      }
      document.addEventListener('touchend', handleTouchEnd, { once: true })
    }
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      return () => {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        clearTimeout(scrollTimeout)
      }
    }
  }, [isScrolling, currentIndex, videos.length])

  const currentVideo = videos[currentIndex]
  const currentEngagement = engagementStates[currentVideo?.id] || {
    isLiked: false,
    isBookmarked: false,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    bookmarkCount: 0
  }

  const nextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, videos.length])
  const previousVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (!hasInteracted) setHasInteracted(true)
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handleTip = () => {
    // TODO: Implement tipping functionality with Aptos
    console.log('Tip sent to', currentVideo.creator || 'Unknown Creator')
  }

  const handleLike = async () => {
    if (!currentUserId || !currentVideo) {
      toast('Please log in to use this feature', { icon: '🔒' })
      return
    }

    try {
      const newIsLiked = !currentEngagement.isLiked
      
      // Optimistic update
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          isLiked: newIsLiked,
          likeCount: newIsLiked 
            ? prev[currentVideo.id].likeCount + 1 
            : prev[currentVideo.id].likeCount - 1
        }
      }))

      // API call
      if (newIsLiked) {
        await apiService.addShortLike(currentUserId, currentVideo.id)
      } else {
        await apiService.removeShortLike(currentUserId, currentVideo.id)
      }

      console.log(`${newIsLiked ? 'Liked' : 'Unliked'} video`, currentVideo.id)
    } catch (error) {
      console.error('Error handling like:', error)
      // Show error message to user
      // Revert optimistic update on error
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          isLiked: !prev[currentVideo.id].isLiked,
          likeCount: !prev[currentVideo.id].isLiked 
            ? prev[currentVideo.id].likeCount + 1 
            : prev[currentVideo.id].likeCount - 1
        }
      }))
    }
  }

  const handleComment = async (content?: string) => {
    if (!currentUserId || !currentVideo) {
      toast('Please log in to use this feature', { icon: '🔒' })
      return
    }
    let commentContent = content;
    if (!commentContent) {
      commentContent = prompt('Add a comment:') || '';
    }
    if (!commentContent.trim()) return;
    // Optimistic update
    const tempComment = {
      id: 'temp-' + Date.now(),
      userId: currentUserId,
      username: currentUser?.username,
      avatar: currentUser?.avatar,
      content: commentContent.trim(),
      createdAt: new Date().toISOString(),
      pending: true
    };
    setComments(prev => ({
      ...prev,
      [currentVideo.id]: [tempComment, ...(prev[currentVideo.id] || [])]
    }));
    setEngagementStates(prev => ({
      ...prev,
      [currentVideo.id]: {
        ...prev[currentVideo.id],
        commentCount: prev[currentVideo.id].commentCount + 1
      }
    }));
    try {
      const comment = await apiService.addShortComment(
        currentVideo.id,
        currentUserId,
        commentContent.trim()
      );
      if (comment) {
        // Transform the returned comment to match frontend structure
        const transformedComment = {
          id: comment.comment.id,
          userId: comment.comment.userId,
          username: comment.user.username,
          avatar: comment.user.avatar,
          content: comment.comment.content,
          createdAt: comment.comment.createdAt,
          likeCount: 0,
          replyCount: 0,
          replies: [],
          pending: false
        };
        setComments(prev => ({
          ...prev,
          [currentVideo.id]: [
            transformedComment,
            ...(prev[currentVideo.id] || []).filter(c => c.id !== tempComment.id)
          ]
        }));
      }
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [currentVideo.id]: (prev[currentVideo.id] || []).filter(c => c.id !== tempComment.id)
      }));
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          commentCount: Math.max(0, prev[currentVideo.id].commentCount - 1)
        }
      }));
    }
  };

  const handleShare = async () => {
    if (!currentUserId || !currentVideo) {
      toast('Please log in to use this feature', { icon: '🔒' })
      return
    }

    try {
      // Create share URL
      const shareUrl = `${window.location.origin}/s/${currentVideo.id}`
      
      // Try to use native sharing if available
      if (navigator.share) {
        await navigator.share({
          title: currentVideo.title || 'Check out this video!',
          text: currentVideo.description || 'Amazing content on our platform',
          url: shareUrl
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
      }

      // Record share in backend
      await apiService.addShortShare(
        currentVideo.id,
        currentUserId,
        'web',
        shareUrl
      )

      // Update share count
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          shareCount: prev[currentVideo.id].shareCount + 1
        }
      }))

      console.log('Shared video', currentVideo.id)
    } catch (error) {
      console.error('Error sharing video:', error)
    }
  }

  const handleBookmark = async () => {
    if (!currentUserId || !currentVideo) {
      toast('Please log in to use this feature', { icon: '🔒' })
      return
    }

    try {
      const newIsBookmarked = !currentEngagement.isBookmarked
      
      // Optimistic update
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          isBookmarked: newIsBookmarked,
          bookmarkCount: newIsBookmarked 
            ? prev[currentVideo.id].bookmarkCount + 1 
            : prev[currentVideo.id].bookmarkCount - 1
        }
      }))

      // API call
      if (newIsBookmarked) {
        await apiService.addShortBookmark(currentUserId, currentVideo.id)
      } else {
        await apiService.removeShortBookmark(currentUserId, currentVideo.id)
      }
    } catch (error) {
      console.error('Error handling bookmark:', error)
      // Revert optimistic update on error
      setEngagementStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          isBookmarked: !prev[currentVideo.id].isBookmarked,
          bookmarkCount: !prev[currentVideo.id].isBookmarked 
            ? prev[currentVideo.id].bookmarkCount + 1 
            : prev[currentVideo.id].bookmarkCount - 1
        }
      }))
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || !currentVideo?.userId) {
      toast('Please log in to use this feature', { icon: '🔒' })
      return
    }

    // Prevent self-following
    if (currentUserId === currentVideo.userId) {
      console.log('Cannot follow yourself')
      return
    }

    const user = await apiService.getUserByUsername(currentVideo.creator)
    const newFollowers = Number(user?.followers) + 1

    try {
      // Follow
      await apiService.followUser(currentUserId, currentVideo.userId)
      setIsFollowing(true)
      await relayerService.updateFollowers(user?.aptosAddress || '', newFollowers)
      console.log('Followed user:', currentVideo.creator)
    } catch (error) {
      console.error('Error handling follow:', error)
      // You could add a toast notification here to show the error to the user
    }
  }

  // Fetch comments when comment section opens
  useEffect(() => {
    if (currentVideo && !comments[currentVideo.id] && !commentsLoading[currentVideo.id]) {
      const fetchComments = async () => {
        try {
          setCommentsLoading(prev => ({ ...prev, [currentVideo.id]: true }));
          const fetchedComments = await apiService.getShortComments(currentVideo.id);
          // Transform the backend comment structure to match frontend expectations
          const transformedComments = fetchedComments.map((item: any) => ({
            id: item.comment.id,
            userId: item.comment.userId,
            username: item.user.username,
            avatar: item.user.avatar,
            content: item.comment.content,
            createdAt: item.comment.createdAt,
            likeCount: 0, // Default values for now
            replyCount: item.replies?.length || 0,
            replies: item.replies?.map((reply: any) => ({
              id: reply.comment.id,
              userId: reply.comment.userId,
              username: reply.user.username,
              avatar: reply.user.avatar,
              content: reply.comment.content,
              createdAt: reply.comment.createdAt,
              likeCount: 0
            })) || []
          }));
          setComments(prev => ({
            ...prev,
            [currentVideo.id]: transformedComments
          }));
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setCommentsLoading(prev => ({ ...prev, [currentVideo.id]: false }));
        }
      };
      fetchComments();
    }
  }, [showComments, currentVideo, comments, commentsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b]">
        <div className="flex flex-row flex-1 justify-center items-end gap-4">
          <div className="flex justify-center items-center relative mt-4">
            <div className="w-[360px] h-[640px] bg-black rounded-lg animate-pulse" />
          </div>
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-black animate-pulse mb-2" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <div className="text-white text-xl mb-2">An error occurred</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    )
  }
  if (!currentVideo) {
    return (
      <div className="h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📹</div>
          <div className="text-white text-xl mb-2">Video not found</div>
          <div className="text-gray-400">No videos available in the database</div>
        </div>
      </div>
    )
  }
  return (
    <div 
      ref={containerRef}
      className="min-h-screen grid grid-cols-3 bg-[#18181b]"
    >
      {/* Reels Feed */}
      <div className="flex flex-row col-span-2 flex-1 h-[calc(100vh-4rem)] overflow-y-auto justify-center items-center relative gap-4">
        <div className="flex flex-row items-end gap-4">
          <div className="video-player flex justify-center items-center relative">
            <video
              ref={videoRef}
              onClick={handleVideoClick}
              onEnded={nextVideo}
              autoPlay={true}
              preload="auto"
            >
              <source src={`${process.env.PUBLIC_API_URL}/api/videos/proxy/${currentVideo.id}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {hasInteracted && videoRef.current && videoRef.current.paused && (
              <div className="play-overlay visible">
                <button className="play-button" onClick={handleVideoClick}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}            
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center">
              <img
                src={currentVideo.creatorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                alt={currentVideo.creator || 'Creator'}
                className="w-11 h-11 rounded-full border-2 border-white"
              />
              {currentUserId !== currentVideo.userId && !isFollowing && (
                <button 
                  onClick={handleFollow} 
                  className={`mt-[-10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-black shadow transition bg-pink-500 hover:bg-pink-600`}
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <button 
              className={`flex flex-col items-center group ${currentEngagement.isLiked ? 'text-red-500' : ''}`} 
              onClick={handleLike}
            >
              <div className={`w-10 h-10 rounded-full ${currentEngagement.isLiked ? 'bg-red-500' : 'bg-[#222]'} flex items-center justify-center mb-1 group-hover:bg-[#333] transition`}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">{currentEngagement.likeCount}</span>
            </button>
            <button className="flex flex-col items-center group" onClick={() => {
              if (!currentUserId) {
                toast('Please log in to use this feature', { icon: '🔒' })
                return
              }
              setShowComments(true)
            }}>
              <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center mb-1 group-hover:bg-[#333] transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">{comments[currentVideo.id]?.length || 0}</span>
            </button>
            <button 
              className={`flex flex-col items-center group ${currentEngagement.isBookmarked ? 'text-yellow-400' : ''}`} 
              onClick={handleBookmark}
            >
              <div className={`w-10 h-10 rounded-full ${currentEngagement.isBookmarked ? 'bg-yellow-500' : 'bg-[#222]'} flex items-center justify-center mb-1 group-hover:bg-[#333] transition`}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">{currentEngagement.bookmarkCount}</span>
            </button>
            <button className="flex flex-col items-center group" onClick={handleShare}>
              <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center mb-1 group-hover:bg-[#333] transition">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">{currentEngagement.shareCount}</span>
            </button>
          </div>
        </div>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 ${showComments ? 'hidden' : ''}`}>
          <button
            className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-2 hover:bg-[#333] transition"
            onClick={previousVideo}
            aria-label="Previous video"
            disabled={currentIndex === 0}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <polyline points="6 15 12 9 18 15" />
            </svg>
          </button>
          <button
            className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center hover:bg-[#333] transition"
            onClick={nextVideo}
            aria-label="Next video"
            disabled={currentIndex === videos.length - 1 && !hasMore}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
        <CommentSection
          open={showComments}
          onClose={() => setShowComments(false)}
          videoId={currentVideo.id}
          currentUser={currentUser}
          comments={comments[currentVideo.id] || []}
          onAddComment={async (content) => handleComment(content)}
          loading={!!commentsLoading[currentVideo.id]}
        />
      </div>

      {/* Pet Feed */}
      <div className='border-l-[1px] border-gray-600 h-[calc(100vh-4rem)] hidden md:flex'>
        <PetFeed />
      </div>
    </div>
  )
} 