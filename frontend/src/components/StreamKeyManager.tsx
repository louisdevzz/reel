import { useState, useEffect } from 'react'
import { StreamKey, apiService } from '../lib/apiService'
import { copyToClipboard, formatStreamKey, downloadConfig, getOBSConfig, getSLOBSConfig, getYouTubeConfig, getFacebookConfig } from '../lib/streamUtils'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUser } from '../lib/userContext'

interface StreamKeyManagerProps {
  onStreamKeySelect?: (streamKey: string) => void
}

export function StreamKeyManager({ onStreamKeySelect }: StreamKeyManagerProps) {
  const { currentUser, isConnected } = useUser()
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([])
  const [selectedKey, setSelectedKey] = useState<StreamKey | null>(null)
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
      const keys = await apiService.getStreamKeys()
      // Ensure keys is always an array
      setStreamKeys(Array.isArray(keys) ? keys : [])
    } catch (error) {
      console.error('Error loading stream keys:', error)
      // Set empty array on error to prevent mapping issues
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
      }
    } catch (error) {
      console.error('Error creating stream key:', error)
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
      if (selectedKey?.id === keyToDelete.id) {
        setSelectedKey(null)
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
    if (!keyToRegenerate || !currentUser) return

    try {
      // For now, we'll create a new key with the same name and delete the old one
      // since the backend doesn't have a regenerate endpoint yet
      const newKey = await apiService.createStreamKey(keyToRegenerate.name, currentUser.id)
      if (newKey) {
        await apiService.deleteStreamKey(keyToRegenerate.id)
        
        setStreamKeys(prev => prev.map(key => key.id === keyToRegenerate.id ? newKey : key))
        if (selectedKey?.id === keyToRegenerate.id) {
          setSelectedKey(newKey)
        }
      }
      setShowRegenerateDialog(false)
      setKeyToRegenerate(null)
    } catch (error) {
      console.error('Error regenerating stream key:', error)
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

  const handleSelectKey = (key: StreamKey) => {
    setSelectedKey(key)
    onStreamKeySelect?.(key.key)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stream Keys</h3>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                Create New Key
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 text-white">
              <DialogHeader>
                <DialogTitle>Create New Stream Key</DialogTitle>
                <DialogDescription>
                  Create a new stream key for your live stream.
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
            <p>No stream keys created yet.</p>
            <p className="text-sm">Create your first stream key to get started.</p>
          </div>
        ) : (
          streamKeys.map((key) => (
            <div
              key={key.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedKey?.id === key.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => handleSelectKey(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{key.name}</h4>
                    {key.isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <code onClick={(e) => {
                        e.stopPropagation()
                        handleCopyKey(key.key)
                        toast.success('Copied to clipboard')
                      }} className="font-mono hover:text-white">{formatStreamKey(key.key)}</code>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsed && (
                      <span className="ml-4">
                        Last used: {new Date(key.lastUsed).toLocaleDateString()}
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
                          setSelectedKey(key)
                          setShowConfigDialog(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-zinc-700 cursor-pointer"
                      >
                        Config
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRegenerateKey(key)
                        }}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-zinc-700 cursor-pointer"
                      >
                        Regenerate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteKey(key)
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
          ))
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
          {selectedKey && (
            <div className="mt-4 space-y-4">
              <div className="border border-white/10 rounded p-4">
                <label className="block mb-2 font-semibold">Stream Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedKey.key}
                    readOnly
                    className="flex-1 bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopyKey(selectedKey.key)}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white text-sm transition-colors"
                  >
                    {copied === selectedKey.key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDownloadConfig(selectedKey.key, 'obs')}
                  className="bg-blue-600 hover:bg-blue-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">OBS Studio</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(selectedKey.key, 'slobs')}
                  className="bg-purple-600 hover:bg-purple-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">Streamlabs OBS</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(selectedKey.key, 'youtube')}
                  className="bg-red-600 hover:bg-red-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">YouTube Live</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
                <button
                  onClick={() => handleDownloadConfig(selectedKey.key, 'facebook')}
                  className="bg-blue-600 hover:bg-blue-700 p-4 rounded text-white transition-colors"
                >
                  <div className="font-semibold">Facebook Live</div>
                  <div className="text-sm opacity-80">Download config</div>
                </button>
              </div>

              <div className="bg-zinc-800 p-4 rounded">
                <h4 className="font-semibold mb-2">Manual Setup Instructions</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Server URL:</strong> rtmp://localhost:1935/live/</p>
                  <p><strong>Stream Key:</strong> {selectedKey.key}</p>
                  <p><strong>Recommended Settings:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Encoder: x264</li>
                    <li>Rate Control: CBR</li>
                    <li>Bitrate: 6000 kbps</li>
                    <li>Keyframe Interval: 2 seconds</li>
                    <li>Preset: veryfast</li>
                    <li>Profile: main</li>
                  </ul>
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