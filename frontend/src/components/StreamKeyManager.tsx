import { useState, useEffect } from 'react'
import { StreamKey, apiService } from '../lib/apiService'
import { copyToClipboard, formatStreamKey, downloadConfig, getOBSConfig, getSLOBSConfig, getYouTubeConfig, getFacebookConfig } from '../lib/streamUtils'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUser } from '../contexts/userContext'

interface StreamKeyManagerProps {
  onStreamKeySelect?: (streamKey: string) => void
}

export function StreamKeyManager({ onStreamKeySelect }: StreamKeyManagerProps) {
  const { currentUser, isConnected } = useUser()
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<StreamKey | null>(null)
  const [keyToRegenerate, setKeyToRegenerate] = useState<StreamKey | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(true)
  
  useEffect(() => {
    if (isConnected && currentUser) {
      loadStreamKeys()
    } else {
      setLoadingKeys(false)
      setStreamKeys([])
    }
  }, [isConnected, currentUser])

  const loadStreamKeys = async () => {
    setLoadingKeys(true)
    try {
      // Get user's stream key if it exists
      const userStreamKey = await apiService.getStreamKeyByUserId(currentUser?.id || '')
      
      if (userStreamKey) {
        setStreamKeys([userStreamKey])
        // Không cần auto-select nữa
        onStreamKeySelect?.(userStreamKey.key)
      } else {
        setStreamKeys([])
      }
    } catch (error) {
      console.error('Error loading stream keys:', error)
      setStreamKeys([])
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !currentUser) return

    setLoading(true)
    try {
      const newKey = await apiService.createStreamKey(newKeyName.trim(), currentUser.id)
      if (newKey) {
        setStreamKeys(prev => [...prev, newKey])
        setNewKeyName('')
        setShowCreateDialog(false)
        toast.success('Stream key created successfully!')
      }
    } catch (error) {
      console.error('Error creating stream key:', error)
      toast.error('Failed to create stream key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKey = async (key: StreamKey) => {
    setKeyToDelete(key)
    setShowDeleteDialog(true)
  }

  const confirmDeleteKey = async () => {
    if (!keyToDelete) return

    try {
      await apiService.deleteStreamKey(keyToDelete.id)
      setStreamKeys(prev => prev.filter(key => key.id !== keyToDelete.id))
      if (streamKeys.length === 0) {
        onStreamKeySelect?.('') // Clear the selected key if no keys left
      }
      setShowDeleteDialog(false)
      setKeyToDelete(null)
    } catch (error) {
      console.error('Error deleting stream key:', error)
    }
  }

  const handleRegenerateKey = async (key: StreamKey) => {
    setKeyToRegenerate(key)
    setShowRegenerateDialog(true)
  }

  const confirmRegenerateKey = async () => {
    if (!keyToRegenerate) return

    try {
      const newKey = await apiService.regenerateStreamKey(keyToRegenerate.id);
      if (newKey) {
        setStreamKeys(prev => prev.map(key => key.id === keyToRegenerate.id ? newKey : key));
        if (streamKeys.length === 0) {
          onStreamKeySelect?.('') // Clear the selected key if no keys left
        }
      }
      setShowRegenerateDialog(false);
      setKeyToRegenerate(null);
    } catch (error) {
      console.error('Error regenerating stream key:', error);
    }
  }

  const handleCopyKey = async (key: string) => {
    const success = await copyToClipboard(key)
    if (success) {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  const handleDownloadConfig = (streamKey: string, platform: string) => {
    let config
    let filename

    switch (platform) {
      case 'obs':
        config = getOBSConfig(streamKey)
        filename = 'obs-config.json'
        break
      case 'slobs':
        config = getSLOBSConfig(streamKey)
        filename = 'slobs-config.json'
        break
      case 'youtube':
        config = getYouTubeConfig(streamKey)
        filename = 'youtube-config.json'
        break
      case 'facebook':
        config = getFacebookConfig(streamKey)
        filename = 'facebook-config.json'
        break
      default:
        return
    }

    downloadConfig(config, filename)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Stream Key</h3>
          <p className="text-sm text-gray-400">Each user can have only one stream key</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                disabled={streamKeys.length > 0}
              >
                {streamKeys.length > 0 ? 'Key Exists' : 'Create Stream Key'}
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 text-white">
              <DialogHeader>
                <DialogTitle>Create New Stream Key</DialogTitle>
                <DialogDescription>
                  Create a new stream key for your live stream. You can only have one stream key per account.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <label className="block mb-2 font-semibold">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter a name for this stream key"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition-colors">
                    Cancel
                  </button>
                </DialogClose>
                <button
                  onClick={handleCreateKey}
                  disabled={loading || !newKeyName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 px-4 py-2 rounded text-white transition-colors"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {!isConnected ? (
          <div className="text-center py-8 text-gray-400">
            <p>Please connect your wallet to manage stream keys.</p>
          </div>
        ) : loadingKeys ? (
          <div className="text-center py-8 text-gray-400">
            <p>Loading stream keys...</p>
          </div>
        ) : !Array.isArray(streamKeys) || streamKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No stream key created yet.</p>
            <p className="text-sm">Click "Create Stream Key" to get started with live streaming.</p>
          </div>
        ) : (
          <div
            className={`p-4 border rounded-lg transition-colors border-purple-500 bg-purple-500/10`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{streamKeys[0].name}</h4>
                  {streamKeys[0].isActive && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <code onClick={(e) => {
                      e.stopPropagation()
                      handleCopyKey(streamKeys[0].key)
                      toast.success('Copied to clipboard')
                    }} className="font-mono hover:text-white cursor-pointer">{streamKeys[0].key}</code>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Created: {new Date(streamKeys[0].createdAt).toLocaleDateString()}
                  {streamKeys[0].lastUsed && (
                    <span className="ml-4">
                      Last used: {new Date(streamKeys[0].lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-800 border border-white/10 text-white">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowConfigDialog(true)
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      Config
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegenerateKey(streamKeys[0])
                      }}
                      className="text-yellow-400 hover:text-yellow-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteKey(streamKeys[0])
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-zinc-900 text-white md:min-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stream Configuration</DialogTitle>
            <DialogDescription>
              Download configuration files for your streaming software.
            </DialogDescription>
          </DialogHeader>
          {streamKeys[0] && (
            <div className="mt-4 space-y-4">
              <div className="border border-white/10 rounded p-4">
                <label className="block mb-2 font-semibold">Stream Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={streamKeys[0].key}
                    readOnly
                    className="flex-1 bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopyKey(streamKeys[0].key)}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white text-sm transition-colors"
                  >
                    {copied === streamKeys[0].key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDownloadConfig(streamKeys[0].key, 'obs')}
                  className="bg-blue-600 hover:bg-blue-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">OBS Studio</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(streamKeys[0].key, 'slobs')}
                  className="bg-purple-600 hover:bg-purple-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">Streamlabs OBS</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(streamKeys[0].key, 'youtube')}
                  className="bg-red-600 hover:bg-red-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">YouTube Live</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(streamKeys[0].key, 'facebook')}
                  className="bg-blue-600 hover:bg-blue-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">Facebook Live</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
              </div>

              <div className="bg-zinc-800 p-4 rounded">
                <h4 className="font-semibold mb-2">Manual Setup Instructions</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Server URL:</strong> rtmp://rtmp.livepeer.com/live</p>
                  <p><strong>Stream Key:</strong> {streamKeys[0].key}</p>
                  <p><strong>Playback URL:</strong> {streamKeys[0].playbackUrl || 'Not available'}</p>
                  <p><strong>Stream ID:</strong> {streamKeys[0].livepeerStreamId || 'Not available'}</p>
                  <p><strong>Recommended Settings:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Encoder: x264</li>
                    <li>Rate Control: CBR</li>
                    <li>Bitrate: 6000 kbps</li>
                    <li>Keyframe Interval: 2 seconds</li>
                    <li>Preset: veryfast</li>
                    <li>Profile: main</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <p className="text-blue-400 font-semibold mb-1">💡 Livepeer Studio Integration</p>
                    <p className="text-sm text-blue-300">
                      Your stream is now powered by Livepeer Studio. Use the RTMP URL above with your stream key to start broadcasting.
                    </p>
                    <p className="text-sm text-blue-300 mt-1">
                      The stream will automatically be detected when you start broadcasting from OBS or other streaming software.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition-colors">
                Close
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>Delete Stream Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this stream key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {keyToDelete && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded">
              <div className="font-semibold text-red-400 mb-2">{keyToDelete.name}</div>
              <div className="text-sm text-gray-400 font-mono">
                {formatStreamKey(keyToDelete.key)}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={confirmDeleteKey}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>Regenerate Stream Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to regenerate this stream key? The current key will be invalidated and any active streams using it will be disconnected.
            </DialogDescription>
          </DialogHeader>
          {keyToRegenerate && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <div className="font-semibold text-yellow-400 mb-2">{keyToRegenerate.name}</div>
              <div className="text-sm text-gray-400 font-mono">
                {formatStreamKey(keyToRegenerate.key)}
              </div>
              <div className="text-xs text-yellow-400 mt-2">
                ⚠️ This key will be replaced with a new one
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={confirmRegenerateKey}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white transition-colors"
            >
              Regenerate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 