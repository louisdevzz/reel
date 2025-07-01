import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog'

interface OBSGuideProps {
  streamKey: string
}

export function OBSGuide({ streamKey }: OBSGuideProps) {
  const [activeTab, setActiveTab] = useState<'obs' | 'slobs' | 'youtube' | 'facebook'>('obs')

  const tabs = [
    { id: 'obs', name: 'OBS Studio', icon: '📹' },
    { id: 'slobs', name: 'Streamlabs OBS', icon: '🎬' },
    { id: 'youtube', name: 'YouTube Live', icon: '📺' },
    { id: 'facebook', name: 'Facebook Live', icon: '📘' }
  ] as const

  const getServerUrl = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'rtmp://a.rtmp.youtube.com/live2'
      case 'facebook':
        return 'rtmp://live-api-s.facebook.com/rtmp'
      default:
        return 'rtmp://localhost:1935/live/'
    }
  }

  const getInstructions = (platform: string) => {
    const baseInstructions = [
      '1. Open your streaming software',
      '2. Go to Settings > Stream',
      '3. Select "Custom" as the service',
      '4. Enter the Server URL and Stream Key below',
      '5. Click "Apply" and "OK"',
      '6. Start streaming!'
    ]

    switch (platform) {
      case 'obs':
        return [
          '1. Open OBS Studio',
          '2. Go to Settings > Stream',
          '3. Select "Custom" as the service',
          '4. Enter the Server URL and Stream Key below',
          '5. Click "Apply" and "OK"',
          '6. Click "Start Streaming" in OBS'
        ]
      case 'slobs':
        return [
          '1. Open Streamlabs OBS',
          '2. Go to Settings > Stream',
          '3. Select "Custom RTMP" as the service',
          '4. Enter the Server URL and Stream Key below',
          '5. Click "Save Settings"',
          '6. Click "Go Live" in Streamlabs OBS'
        ]
      case 'youtube':
        return [
          '1. Go to YouTube Studio > Go Live',
          '2. Create a new stream',
          '3. Copy the Stream Key from YouTube',
          '4. Use the Server URL below',
          '5. Configure your streaming software',
          '6. Start streaming to YouTube'
        ]
      case 'facebook':
        return [
          '1. Go to Facebook Live Producer',
          '2. Create a new live video',
          '3. Copy the Stream Key from Facebook',
          '4. Use the Server URL below',
          '5. Configure your streaming software',
          '6. Start streaming to Facebook'
        ]
      default:
        return baseInstructions
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
          📖 OBS Setup Guide
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 text-white md:min-w-[800px] w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Streaming Software Setup Guide</DialogTitle>
          <DialogDescription>
            Follow these instructions to connect your streaming software to your stream key.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {/* Platform Tabs */}
          <div className="flex space-x-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-zinc-800 p-4 rounded">
              <h3 className="font-semibold mb-3">Setup Instructions</h3>
              <ol className="space-y-2 text-sm">
                {getInstructions(activeTab).map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-400 font-semibold">{instruction.split('.')[0]}.</span>
                    <span>{instruction.split('.').slice(1).join('.').trim()}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Connection Details */}
            <div className="bg-zinc-800 p-4 rounded">
              <h3 className="font-semibold mb-3">Connection Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Server URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={getServerUrl(activeTab)}
                      readOnly
                      className="flex-1 bg-zinc-700 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(getServerUrl(activeTab))}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white text-sm transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stream Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={streamKey}
                      readOnly
                      className="flex-1 bg-zinc-700 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(streamKey)}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white text-sm transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Settings */}
            <div className="bg-zinc-800 p-4 rounded">
              <h3 className="font-semibold mb-3">Recommended Settings</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Video Settings</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Resolution: 1920x1080</li>
                    <li>• FPS: 30 or 60</li>
                    <li>• Bitrate: 6000 kbps</li>
                    <li>• Keyframe Interval: 2 seconds</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Audio Settings</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Sample Rate: 48 kHz</li>
                    <li>• Channels: Stereo</li>
                    <li>• Bitrate: 160 kbps</li>
                    <li>• Codec: AAC</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-zinc-800 p-4 rounded">
              <h3 className="font-semibold mb-3">Troubleshooting</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span>If you get "Connection failed", check your internet connection and try again.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span>If stream is choppy, try reducing the bitrate to 4000 kbps.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span>Make sure your stream key is correct and not expired.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span>For YouTube/Facebook, use their provided stream keys instead.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition-colors">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 