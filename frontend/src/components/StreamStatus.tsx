import { useState, useEffect } from 'react'
import { apiService, StreamSession } from '../lib/apiService'
import toast from 'react-hot-toast'

interface StreamStatusProps {
  streamKey: string | null
  onStreamStart?: () => void
  onStreamStop?: () => void
}

export function StreamStatus({ streamKey, onStreamStart, onStreamStop }: StreamStatusProps) {
  const [currentSession, setCurrentSession] = useState<StreamSession | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [localDuration, setLocalDuration] = useState(0)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!streamKey) {
      setCurrentSession(null)
      setLocalDuration(0)
      setError('')
      return
    }

    // Find active session for this stream key
    const findActiveSession = async () => {
      try {
        setError('')
        const activeSessions = await apiService.getActiveSessions()
        const session = activeSessions.find(s => s.streamKey === streamKey)
        setCurrentSession(session || null)
        if (session && session.status === 'live') {
          setLocalDuration(session.duration)
        } else {
          setLocalDuration(0)
        }
      } catch (error) {
        console.error('Error getting active sessions:', error)
        setError('Failed to check stream status')
      }
    }

    findActiveSession()
    
    // Poll for session updates
    const interval = setInterval(findActiveSession, 5000)
    return () => clearInterval(interval)
  }, [streamKey])

  useEffect(() => {
    if (currentSession?.status === 'live') {
      const interval = setInterval(() => {
        setLocalDuration(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentSession?.status])

  const handleStartStream = async () => {
    if (!streamKey) return

    setIsStarting(true)
    setError('')
    try {
      // First, find the stream key ID
      const streamKeys = await apiService.getStreamKeys()
      const streamKeyData = streamKeys.find(key => key.key === streamKey)
      
      if (!streamKeyData) {
        throw new Error('Stream key not found')
      }

      // Create a new session
      const session = await apiService.createSession(streamKeyData.id, 'Live Stream', 'Stream started from dashboard')
      
      if (!session) {
        throw new Error('Failed to create session')
      }

      // Start the stream
      const startedSession = await apiService.startStream(session.id)
      
      if (!startedSession) {
        throw new Error('Failed to start stream')
      }

      setCurrentSession(startedSession)
      setLocalDuration(0)
      toast.success('Stream started successfully')
      onStreamStart?.()
    } catch (error) {
      console.error('Error starting stream:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start stream'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopStream = async () => {
    if (!currentSession) return

    setIsStopping(true)
    setError('')
    try {
      const stoppedSession = await apiService.stopStream(currentSession.id)
      
      if (!stoppedSession) {
        throw new Error('Failed to stop stream')
      }

      setCurrentSession(stoppedSession)
      toast.success('Stream stopped successfully')
      onStreamStop?.()
    } catch (error) {
      console.error('Error stopping stream:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop stream'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsStopping(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isLive = currentSession?.status === 'live'
  const viewers = currentSession?.viewerCount || 0
  const duration = isLive ? localDuration : (currentSession?.duration || 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stream Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-sm font-medium">
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/20 p-3 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {!streamKey ? (
        <div className="text-center py-8 text-gray-400">
          <p>No stream key selected</p>
          <p className="text-sm">Select a stream key to start streaming</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stream Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleStartStream}
              disabled={isLive || isStarting || !streamKey}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors"
            >
              {isStarting ? 'Starting...' : 'Start Stream'}
            </button>
            <button
              onClick={handleStopStream}
              disabled={!isLive || isStopping}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors"
            >
              {isStopping ? 'Stopping...' : 'Stop Stream'}
            </button>
          </div>

          {/* Stream Stats */}
          {isLive && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded text-center">
                <div className="text-2xl font-bold text-red-500">{viewers}</div>
                <div className="text-sm text-gray-400">Viewers</div>
              </div>
              <div className="bg-zinc-800 p-4 rounded text-center">
                <div className="text-2xl font-bold text-white">{formatDuration(duration)}</div>
                <div className="text-sm text-gray-400">Duration</div>
              </div>
              <div className="bg-zinc-800 p-4 rounded text-center">
                <div className="text-2xl font-bold text-green-500">●</div>
                <div className="text-sm text-gray-400">Live</div>
              </div>
            </div>
          )}

          {/* Stream Preview */}
          <div className="w-full aspect-video bg-black flex items-center justify-center relative border border-white/10 rounded-lg">
            {isLive ? (
              <>
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  LIVE
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {viewers} viewers
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📺</div>
                  <div className="text-white font-semibold">Live Stream</div>
                  <div className="text-gray-400 text-sm">{formatDuration(duration)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-4 right-4 text-xs bg-black/70 px-2 py-1 rounded">OFFLINE</div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div className="text-white font-semibold">Stream Preview</div>
                  <div className="text-gray-400 text-sm">Click "Start Stream" to begin</div>
                </div>
              </>
            )}
          </div>

          {/* Stream Info */}
          {streamKey && (
            <div className="bg-zinc-800 p-4 rounded">
              <h4 className="font-semibold mb-2">Stream Configuration</h4>
              <div className="text-sm space-y-1">
                <p><strong>Server:</strong> rtmp://localhost:1935/live/</p>
                <p><strong>Stream Key:</strong> {streamKey}</p>
                <p><strong>Status:</strong> {isLive ? 'Live' : 'Ready to start'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 