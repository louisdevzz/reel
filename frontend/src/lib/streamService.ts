import { StreamKey, StreamSettings, generateStreamKey, generateId } from './streamUtils'

// Mock storage for stream keys (in real app, this would be an API)
class StreamKeyService {
  private streamKeys: StreamKey[] = []
  private streamSettings: StreamSettings[] = []

  constructor() {
    // Initialize with some mock data
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const storedKeys = localStorage.getItem('streamKeys')
      const storedSettings = localStorage.getItem('streamSettings')
      
      if (storedKeys) {
        this.streamKeys = JSON.parse(storedKeys).map((key: any) => ({
          ...key,
          createdAt: new Date(key.createdAt),
          lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined
        }))
      }
      
      if (storedSettings) {
        this.streamSettings = JSON.parse(storedSettings)
      }
    } catch (error) {
      console.error('Error loading stream data:', error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('streamKeys', JSON.stringify(this.streamKeys))
      localStorage.setItem('streamSettings', JSON.stringify(this.streamSettings))
    } catch (error) {
      console.error('Error saving stream data:', error)
    }
  }

  // Create a new stream key
  async createStreamKey(name: string): Promise<StreamKey> {
    const newKey: StreamKey = {
      id: generateId(),
      key: generateStreamKey(),
      name,
      isActive: true,
      createdAt: new Date()
    }

    this.streamKeys.push(newKey)
    this.saveToStorage()
    
    return newKey
  }

  // Get all stream keys
  async getStreamKeys(): Promise<StreamKey[]> {
    return [...this.streamKeys]
  }

  // Get a specific stream key
  async getStreamKey(id: string): Promise<StreamKey | null> {
    return this.streamKeys.find(key => key.id === id) || null
  }

  // Update stream key
  async updateStreamKey(id: string, updates: Partial<StreamKey>): Promise<StreamKey | null> {
    const index = this.streamKeys.findIndex(key => key.id === id)
    if (index === -1) return null

    this.streamKeys[index] = { ...this.streamKeys[index], ...updates }
    this.saveToStorage()
    
    return this.streamKeys[index]
  }

  // Delete stream key
  async deleteStreamKey(id: string): Promise<boolean> {
    const index = this.streamKeys.findIndex(key => key.id === id)
    if (index === -1) return false

    this.streamKeys.splice(index, 1)
    this.saveToStorage()
    
    return true
  }

  // Regenerate stream key
  async regenerateStreamKey(id: string): Promise<StreamKey | null> {
    const index = this.streamKeys.findIndex(key => key.id === id)
    if (index === -1) return null

    this.streamKeys[index].key = generateStreamKey()
    this.streamKeys[index].lastUsed = new Date()
    this.saveToStorage()
    
    return this.streamKeys[index]
  }

  // Save stream settings
  async saveStreamSettings(settings: StreamSettings): Promise<void> {
    const existingIndex = this.streamSettings.findIndex(s => s.streamKey === settings.streamKey)
    
    if (existingIndex !== -1) {
      this.streamSettings[existingIndex] = settings
    } else {
      this.streamSettings.push(settings)
    }
    
    this.saveToStorage()
  }

  // Get stream settings
  async getStreamSettings(streamKey: string): Promise<StreamSettings | null> {
    return this.streamSettings.find(s => s.streamKey === streamKey) || null
  }

  // Get all stream settings
  async getAllStreamSettings(): Promise<StreamSettings[]> {
    return [...this.streamSettings]
  }

  // Start streaming (mock function)
  async startStream(streamKey: string): Promise<{ success: boolean; message: string }> {
    // In a real app, this would connect to your streaming server
    const key = this.streamKeys.find(k => k.key === streamKey)
    if (!key) {
      return { success: false, message: 'Invalid stream key' }
    }

    // Update last used time
    key.lastUsed = new Date()
    this.saveToStorage()

    // Simulate stream start
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Stream started successfully' })
      }, 1000)
    })
  }

  // Stop streaming (mock function)
  async stopStream(streamKey: string): Promise<{ success: boolean; message: string }> {
    // In a real app, this would disconnect from your streaming server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Stream stopped successfully' })
      }, 500)
    })
  }

  // Get stream status (mock function)
  async getStreamStatus(streamKey: string): Promise<{ isLive: boolean; viewers: number; duration: number }> {
    // In a real app, this would check actual stream status
    const isLive = Math.random() > 0.7 // 30% chance of being live for demo
    return {
      isLive,
      viewers: isLive ? Math.floor(Math.random() * 1000) : 0,
      duration: isLive ? Math.floor(Math.random() * 3600) : 0
    }
  }
}

// Export singleton instance
export const streamKeyService = new StreamKeyService()

// Export types for convenience
export type { StreamKey, StreamSettings } 