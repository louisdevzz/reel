import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { StreamKeyManager } from '../components/StreamKeyManager'
import { StreamPlayer } from '../components/StreamPlayer'
import { apiService } from '../lib/apiService'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { useUser } from '../contexts/userContext'
import { toast } from 'react-hot-toast'
import { streamStatusService } from '../lib/streamService'

export const Route = createFileRoute('/livestream')({
  component: LivestreamPage,
})

function LivestreamPage() {
  const { currentUser, isConnected: userConnected } = useUser()
  const [streamKey, setStreamKey] = useState<string | null>(null)
  const [streamKeyData, setStreamKeyData] = useState<any>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [loadingLiveStream, setLoadingLiveStream] = useState(true)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [livepeerStatus, setLivepeerStatus] = useState<{ isActive: boolean; isLive: boolean } | null>(null)

  // Update document title
  useEffect(() => {
    if (isLive) {
      document.title = `Live Streaming - Reel`;
    } else {
      document.title = "Livestream Studio - Reel";
    }
    
    // Reset title when component unmounts
    return () => {
      document.title = "Reel – A Decentralized SocialFi Platform for Video and Livestreaming";
    };
  }, [isLive]);

  // Check backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsConnecting(true)
      try {
        await apiService.getStreamKeys()
        setIsConnected(true)
        setIsConnecting(false)
      } catch (error) {
        console.error('Backend connection failed:', error)
        setIsConnected(false)
        setIsConnecting(false)
      }
    }
    
    checkConnection()
  }, [])

  // Auto-load current user's stream key và kiểm tra Livepeer status
  useEffect(() => {
    if (!isConnected || !userConnected || !currentUser) {
      setLoadingLiveStream(false)
      return
    }

    const loadUserStreamKey = async () => {
      setLoadingLiveStream(true)
      try {
        // Get current user's stream key (only if exists)
        const userStreamKey = await apiService.getStreamKeyByUserId(currentUser.id)
        if (userStreamKey) {
          setStreamKey(userStreamKey.key)
          setStreamKeyData(userStreamKey)
          // Không checkLivepeerStreamStatus ở đây nữa
        } else {
          setStreamKey(null)
          setStreamKeyData(null)
          setIsLive(false)
          setCurrentSession(null)
        }
      } catch (error) {
        setStreamKey(null)
        setStreamKeyData(null)
        setIsLive(false)
        setCurrentSession(null)
      } finally {
        setLoadingLiveStream(false)
      }
    }
    loadUserStreamKey()
  }, [isConnected, userConnected, currentUser])

  // Sử dụng WebSocket để check live status
  useEffect(() => {
    if (!streamKey) {
      setIsLive(false)
      setLivepeerStatus(null)
      streamStatusService.disconnect()
      return
    }
    // Kết nối WebSocket
    streamStatusService.connect(streamKey)
    // Lắng nghe status
    streamStatusService.onStatus((status) => {
      setIsLive(!!status.isLive)
      setLivepeerStatus((prev) => ({ ...(prev || {}), isLive: !!status.isLive, isActive: true }))
      if (status.isLive) {
        loadSessionInfo()
      } else {
        setCurrentSession(null)
      }
    })
    // Ngắt kết nối khi unmount/đổi streamKey
    return () => {
      streamStatusService.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamKey])

  // Xóa poll checkLivepeerStreamStatus (bỏ useEffect poll 5s)

  const loadSessionInfo = async () => {
    if (!streamKey) return
    
    try {
      const session = await apiService.getLiveSessionByStreamKey(streamKey)
      if (session) {
        setCurrentSession(session)
        setStreamTitle(session.stream_sessions?.title || session.title || '')
        setStreamDescription(session.stream_sessions?.description || session.description || '')
      } else {
        setCurrentSession(null)
        setStreamTitle('')
        setStreamDescription('')
      }
    } catch (error) {
      console.error('Error loading session info:', error)
      setCurrentSession(null)
      setStreamTitle('')
      setStreamDescription('')
    }
  }

  useEffect(() => {
    setIsStreaming(isLive)
  }, [isLive])

  const handleStreamKeySelect = (key: string) => {
    setStreamKey(key)
  }

  const handleRetryConnection = async () => {
    setIsConnecting(true)
    try {
      await apiService.getStreamKeys()
      setIsConnected(true)
      setIsConnecting(false)
    } catch (error) {
      console.error('Backend connection failed:', error)
      setIsConnected(false)
      setIsConnecting(false)
    }
  }

  const handleStartStream = async () => {
    if (!streamKey || !streamKeyData) return
    
    try {
      // Check if there's already a live session
      const existingSession = await apiService.getLiveSessionByStreamKey(streamKey)
      if (existingSession) {
        toast.error('Stream is already live!')
        setCurrentSession(existingSession)
        setStreamTitle(existingSession.stream_sessions?.title || existingSession.title || '')
        setStreamDescription(existingSession.stream_sessions?.description || existingSession.description || '')
        return
      }

      // Create session
      const session = await apiService.createSession(streamKeyData.id, streamTitle, streamDescription)
      if (session) {
        // Start the session
        await apiService.startStream(session.id)
        setShowStartDialog(false)
        setCurrentSession(session)
        toast.success('Stream prepared successfully! You can now start broadcasting from your streaming software.')
      }
    } catch (error) {
      console.error('Failed to start stream:', error)
      toast.error('Failed to start stream')
    }
  }

  const handleStopStream = async () => {
    if (!currentSession) return
    
    // Get the session ID from the nested structure
    const sessionId = currentSession.stream_sessions?.id || currentSession.id
    if (!sessionId) {
      console.error('No session ID found in currentSession:', currentSession)
      toast.error('Unable to stop stream: session ID not found')
      return
    }
    
    try {
      await apiService.stopStream(sessionId)
      
      // Clear chat messages for this stream
      if (streamKey) {
        try {
          await apiService.clearChatMessages(streamKey)
          console.log('🗑️ Chat messages cleared for stream:', streamKey)
        } catch (chatError) {
          console.error('Failed to clear chat messages:', chatError)
          // Don't fail the stream stop if chat clearing fails
        }
      }
      
      setCurrentSession(null)
      setStreamTitle('')
      setStreamDescription('')
      toast.success('Stream stopped successfully!')
    } catch (error) {
      console.error('Failed to stop stream:', error)
      toast.error('Failed to stop stream')
    }
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white flex flex-col">
      {/* Connection Status */}
      {isConnecting && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/20 p-3 text-center">
          <span className="text-yellow-400 font-semibold">
            🔄 Connecting to backend server...
          </span>
        </div>
      )}
      

      {!userConnected && (
        <div className="bg-blue-500/20 border-b border-blue-500/20 p-3 text-center">
          <span className="text-blue-400 font-semibold">
            🔗 Please connect your wallet to access streaming features
          </span>
        </div>
      )}
      
      <div className="flex flex-1">
        {/* Stream Key Management Panel */}
        <div className="flex flex-col w-1/3 border-r border-white/10 min-h-screen">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-medium">Stream Management</span>
              {isConnected && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Connected
                </span>
              )}
              {!isConnected && !isConnecting && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <StreamKeyManager onStreamKeySelect={handleStreamKeySelect} />
          </div>
        </div>

        {/* Live Stream Panel */}
        <div className="flex flex-col w-2/3 min-h-screen">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium">Live Stream</span>
              {loadingLiveStream && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  🔄 Loading...
                </span>
              )}
              {!loadingLiveStream && isLive && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  🔴 LIVE
                </span>
              )}
              {!loadingLiveStream && !isLive && livepeerStatus?.isActive && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  ⚡ READY
                </span>
              )}
              {!loadingLiveStream && !isLive && !livepeerStatus?.isActive && (
                <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
                  ⚫ OFFLINE
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {streamKey && !isLive && livepeerStatus?.isActive && (
                <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                  <DialogTrigger asChild>
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                      Prepare Stream
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#232327] border-[#2f2f35] text-white">
                  <DialogHeader>
                    <DialogTitle>Prepare Live Stream</DialogTitle>
                  </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Stream Title</label>
                        <input
                          type="text"
                          value={streamTitle}
                          onChange={(e) => setStreamTitle(e.target.value)}
                          className="w-full bg-[#18181b] border border-[#2f2f35] rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Enter stream title..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={streamDescription}
                          onChange={(e) => setStreamDescription(e.target.value)}
                          className="w-full bg-[#18181b] border border-[#2f2f35] rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Enter stream description..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowStartDialog(false)}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStartStream}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition-colors"
                        >
                          Prepare Stream
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {streamKey && isLive && currentSession && (
                <button 
                  onClick={handleStopStream}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Stop Stream
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
            {!userConnected ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
                <p className="text-gray-400">Please connect your wallet to access streaming features</p>
              </div>
            ) : loadingLiveStream ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your stream key...</p>
              </div>
            ) : isLive && streamKey ? (
              <div className="w-full">
                {currentSession && (currentSession.stream_sessions?.title || currentSession.title || currentSession.stream_sessions?.description || currentSession.description) && (
                  <div className="mb-4 p-4 bg-[#232327] rounded-lg border border-[#2f2f35]">
                    {(currentSession.stream_sessions?.title || currentSession.title) && (
                      <h3 className="text-lg font-semibold mb-2">{currentSession.stream_sessions?.title || currentSession.title}</h3>
                    )}
                    {(currentSession.stream_sessions?.description || currentSession.description) && (
                      <p className="text-gray-400 text-sm">{currentSession.stream_sessions?.description || currentSession.description}</p>
                    )}
                  </div>
                )}
                <StreamPlayer 
                  streamKey={streamKey} 
                  playbackUrl={streamKeyData?.playbackUrl}
                  streamId={streamKeyData?.livepeerStreamId}
                  playbackId={streamKeyData?.livepeerStreamId} // Use livepeerStreamId as playbackId
                />
              </div>
            ) : !streamKey ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold mb-2">Create Stream Key</h3>
                <p className="text-gray-400 mb-4">
                  You need to create a stream key to start broadcasting. Use the Stream Management panel on the left to create your first stream key.
                </p>
                <p className="text-sm text-gray-500">Once you have a stream key, you can start broadcasting from your streaming software (OBS, Streamlabs, etc.)</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-xl font-semibold mb-2">
                  {livepeerStatus?.isActive ? 'Stream Ready' : 'No Live Stream'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {livepeerStatus?.isActive 
                    ? 'Your stream key is ready. Click "Prepare Stream" to set up your broadcast'
                    : 'Your stream key is ready. Start broadcasting from your streaming software (OBS, Streamlabs, etc.)'
                  }
                </p>
                <p className="text-sm text-gray-500">Then start broadcasting from your streaming software (OBS, Streamlabs, etc.)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 