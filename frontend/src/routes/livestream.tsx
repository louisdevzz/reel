import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { StreamKeyManager } from '../components/StreamKeyManager'
import { StreamStatus } from '../components/StreamStatus'
import { StreamPlayer } from '../components/StreamPlayer'
import { apiService } from '../lib/apiService'

export const Route = createFileRoute('/livestream')({
  component: LivestreamPage,
})

function LivestreamPage() {
  const [selectedStreamKey, setSelectedStreamKey] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [wsVersion, setWsVersion] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

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

  // Thay polling bằng WebSocket
  useEffect(() => {
    if (!selectedStreamKey) {
      setIsLive(false)
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const ws = new WebSocket(`ws://localhost:3001/ws/stream-status?key=${selectedStreamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔍 Received stream status:', data);
        setIsLive(!!data.isLive);
      } catch {
        setIsLive(false);
      }
    };

    ws.onerror = () => {
      setIsLive(false);
    };

    ws.onclose = () => {
      setIsLive(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [selectedStreamKey, wsVersion]);

  useEffect(() => {
    setIsStreaming(isLive)
  }, [isLive])

  const handleStreamKeySelect = (streamKey: string) => {
    setSelectedStreamKey(streamKey)
  }

  const handleStreamStart = () => {
    setIsStreaming(true)
    setWsVersion(v => v + 1)
  }

  const handleStreamStop = () => {
    setIsStreaming(false)
    setWsVersion(v => v + 1)
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Connection Status */}
      {isConnecting && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/20 p-3 text-center">
          <span className="text-yellow-400 font-semibold">
            🔄 Connecting to backend server...
          </span>
        </div>
      )}
      
      {!isConnecting && !isConnected && (
        <div className="bg-red-500/20 border-b border-red-500/20 p-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-red-400 font-semibold">
              ⚠️ Backend connection failed. Please ensure the backend server is running on http://localhost:3001
            </span>
            <button 
              onClick={handleRetryConnection}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
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

        {/* Stream Status & Preview Panel */}
        <div className="flex flex-col w-1/3 border-r border-white/10 min-h-screen">
          <div className="p-4 border-b border-white/10">
            <span className="font-medium">Stream Status</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <StreamStatus 
              streamKey={selectedStreamKey}
              onStreamStart={handleStreamStart}
              onStreamStop={handleStreamStop}
            />
            {/* Hiển thị video khi isLive */}
            {isLive ? (
              <StreamPlayer streamKey={selectedStreamKey} />
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📺</div>
                <div>Chưa có tín hiệu stream. Hãy bắt đầu stream trên OBS!</div>
              </div>
            )}
          </div>
        </div>

        {/* Chat & Activity Panel */}
        <div className="flex flex-col w-1/3 min-h-screen">
          <div className="p-4 border-b border-white/10">
            <span className="font-medium">Live Chat</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {!isConnected ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">🔌</div>
                <h2 className="text-xl font-bold mb-2">Backend Disconnected</h2>
                <p className="text-sm">Connect to backend to enable chat</p>
              </div>
            ) : isLive ? (
              <div className="space-y-4">
                <div className="bg-zinc-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold">Live Chat</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Welcome to the live stream! Chat is now active.
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-zinc-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold">Viewer123:</span>
                      <span className="text-sm">Great stream! 👏</span>
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold">StreamFan:</span>
                      <span className="text-sm">Love the content! 🔥</span>
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold">ChatUser:</span>
                      <span className="text-sm">How do I set up OBS? 🤔</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-xl font-bold mb-2">Chat is offline</h2>
                <p className="text-sm">Start streaming to enable live chat</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/10 flex">
            <input
              type="text"
              className="flex-1 bg-black border border-white/20 rounded px-3 py-2 text-white"
              placeholder={isLive ? "Type a message..." : "Chat is offline"}
              disabled={!isLive || !isConnected}
            />
            <button 
              className="ml-2 bg-purple-600 px-4 py-2 rounded text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={!isLive || !isConnected}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 