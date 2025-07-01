// Utility functions for stream management

export interface StreamKey {
  id: string
  key: string
  name: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}

export interface StreamSettings {
  title: string
  description: string
  category: string
  tags: string[]
  isPrivate: boolean
  streamKey: string
}

// Generate a secure stream key
export function generateStreamKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk_live_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Validate stream key format
export function isValidStreamKey(key: string): boolean {
  return /^sk_live_[A-Za-z0-9]{32}$/.test(key)
}

// Format stream key for display (with masking)
export function formatStreamKey(key: string, showFull: boolean = false): string {
  if (!showFull) {
    return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`
  }
  return key
}

// Get OBS configuration
export function getOBSConfig(streamKey: string, serverUrl: string = 'rtmp://localhost:1935/live/') {
  return {
    serverUrl,
    streamKey,
    settings: {
      outputMode: 'advanced',
      encoder: 'x264',
      rateControl: 'CBR',
      bitrate: 6000,
      keyframeInterval: 2,
      preset: 'veryfast',
      profile: 'main',
      tune: 'zerolatency'
    }
  }
}

// Get Streamlabs OBS configuration
export function getSLOBSConfig(streamKey: string, serverUrl: string = 'rtmp://localhost:1935/live/') {
  return {
    serverUrl,
    streamKey,
    settings: {
      outputMode: 'advanced',
      encoder: 'x264',
      rateControl: 'CBR',
      bitrate: 6000,
      keyframeInterval: 2,
      preset: 'veryfast',
      profile: 'main',
      tune: 'zerolatency'
    }
  }
}

// Get YouTube Live configuration
export function getYouTubeConfig(streamKey: string) {
  return {
    serverUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey,
    settings: {
      outputMode: 'advanced',
      encoder: 'x264',
      rateControl: 'CBR',
      bitrate: 6000,
      keyframeInterval: 2,
      preset: 'veryfast',
      profile: 'main',
      tune: 'zerolatency'
    }
  }
}

// Get Facebook Live configuration
export function getFacebookConfig(streamKey: string) {
  return {
    serverUrl: 'rtmp://live-api-s.facebook.com/rtmp',
    streamKey,
    settings: {
      outputMode: 'advanced',
      encoder: 'x264',
      rateControl: 'CBR',
      bitrate: 6000,
      keyframeInterval: 2,
      preset: 'veryfast',
      profile: 'main',
      tune: 'zerolatency'
    }
  }
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Download configuration file
export function downloadConfig(config: any, filename: string) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
} 