import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { StreamKeyManager } from '../components/StreamKeyManager'
import { StreamPlayer } from '../components/StreamPlayer'
import { apiService } from '../lib/apiService'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { useUser } from '../lib/userContext'
import { toast } from 'react-hot-toast'

export const Route = createFileRoute('/livestream')({
  component: LivestreamPage,
})

function LivestreamPage() {
  const { currentUser, isConnected: userConnected } = useUser()
  const [streamKey, setStreamKey] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [wsVersion, setWsVersion] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [loadingLiveStream, setLoadingLiveStream] = useState(true)
  const [currentSession, setCurrentSession] = useState<any>(null)

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

  // Auto-load current user's stream key
  useEffect(() => {
    if (!isConnected || !userConnected || !currentUser) {
      setLoadingLiveStream(false)
      return
    }

    const loadUserStreamKey = async () => {
      setLoadingLiveStream(true)
      try {
        // Get current user's stream key
        const userStreamKey = await apiService.getStreamKeyByUserId(currentUser.id)
        
        if (userStreamKey) {
          setStreamKey(userStreamKey.key)
          setIsLive(!!userStreamKey.isLive)
          
          // If stream is live, get current session info
          if (userStreamKey.isLive) {
            try {
              const session = await apiService.getLiveSessionByStreamKey(userStreamKey.key)
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
        } else {
          console.log('📺 No stream key found for user')
          setStreamKey(null)
          setIsLive(false)
          setCurrentSession(null)
        }
      } catch (error) {
        console.error('Error loading user stream key:', error)
        setStreamKey(null)
        setIsLive(false)
        setCurrentSession(null)
      } finally {
        setLoadingLiveStream(false)
      }
    }

    loadUserStreamKey()
  }, [isConnected, userConnected, currentUser])

  // WebSocket connection for real-time stream status
  useEffect(() => {
    if (!streamKey) {
      setIsLive(false)
      setCurrentSession(null)
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    console.log('🔌 Connecting WebSocket for stream key:', streamKey)
    const ws = new WebSocket(`ws://localhost:3002?type=status&key=${streamKey}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected for stream status')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        const wasLive = isLive
        setIsLive(!!data.isLive);
        
                  // If stream went live, get session info
          if (!wasLive && data.isLive) {
            loadSessionInfo()
          }
          
          // If stream went offline, clear the stream key and session
          if (wasLive && !data.isLive) {
            setStreamKey(null)
            setCurrentSession(null)
            setStreamTitle('')
            setStreamDescription('')
          }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
        setIsLive(false);
        setStreamKey(null)
        setCurrentSession(null)
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsLive(false);
      setStreamKey(null)
      setCurrentSession(null)
    };

    ws.onclose = () => {
      console.log('WebSocket closed')
      setIsLive(false);
      setStreamKey(null)
      setCurrentSession(null)
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [streamKey, wsVersion]);

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
    if (!streamKey) return
    
    try {
      // Get stream key data
      const streamKeyData = await apiService.getStreamKeyByKey(streamKey)
      if (!streamKeyData) {
        toast.error('Stream key not found')
        return
      }

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
              {!loadingLiveStream && !isLive && (
                <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
                  ⚫ OFFLINE
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {streamKey && !isLive && (
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
                <StreamPlayer streamKey={streamKey} />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-xl font-semibold mb-2">No Live Stream</h3>
                <p className="text-gray-400 mb-4">Your stream key is ready. Click "Prepare Stream" to set up your broadcast</p>
                <p className="text-sm text-gray-500">Then start broadcasting from your streaming software (OBS, Streamlabs, etc.)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 