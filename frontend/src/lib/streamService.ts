import { apiService } from './apiService'
import { StreamKey, StreamSettings} from './streamUtils'

// Helper function to convert apiService StreamKey to streamUtils StreamKey
function convertApiStreamKey(apiKey: any): StreamKey {
  return {
    ...apiKey,
    createdAt: new Date(apiKey.createdAt),
    lastUsed: apiKey.lastUsed ? new Date(apiKey.lastUsed) : undefined
  }
}

// Frontend service that uses the backend API
class StreamKeyService {
  // Create a new stream key
  async createStreamKey(name: string, userId: string): Promise<StreamKey> {
    try {
      // For now, we'll use the existing method but we need to modify the backend to accept userId
      const streamKey = await apiService.createStreamKey(name, userId)
      if (!streamKey) {
        throw new Error('Failed to create stream key')
      }
      return convertApiStreamKey(streamKey)
    } catch (error) {
      console.error('Error creating stream key:', error)
      throw error
    }
  }

  // Get all stream keys
  async getStreamKeys(): Promise<StreamKey[]> {
    try {
      const apiKeys = await apiService.getStreamKeys()
      return apiKeys.map(convertApiStreamKey)
    } catch (error) {
      console.error('Error fetching stream keys:', error)
      throw error
    }
  }

  // Get stream key by username
  async getStreamKeyByUsername(username: string): Promise<StreamKey | null> {
    try {
      const apiKey = await apiService.getStreamKeyByUsername(username);
      return apiKey ? convertApiStreamKey(apiKey) : null;
    } catch (error) {
      console.error('Error fetching stream key by username:', error);
      return null;
    }
  }

  // Get a specific stream key
  async getStreamKey(id: string): Promise<StreamKey | null> {
    try {
      const apiKey = await apiService.getStreamKey(id)
      return apiKey ? convertApiStreamKey(apiKey) : null
    } catch (error) {
      console.error('Error fetching stream key:', error)
      return null
    }
  }

  // Update stream key
  async updateStreamKey(id: string, updates: Partial<StreamKey>): Promise<StreamKey | null> {
    try {
      // Convert Date objects to strings for the API
      const apiUpdates = {
        ...updates,
        createdAt: updates.createdAt?.toISOString(),
        lastUsed: updates.lastUsed?.toISOString()
      }
      
      const apiKey = await apiService.updateStreamKey(id, apiUpdates)
      return apiKey ? convertApiStreamKey(apiKey) : null
    } catch (error) {
      console.error('Error updating stream key:', error)
      throw error
    }
  }

  // Delete stream key
  async deleteStreamKey(id: string): Promise<boolean> {
    try {
      return await apiService.deleteStreamKey(id)
    } catch (error) {
      console.error('Error deleting stream key:', error)
      throw error
    }
  }

  // Regenerate stream key
  async regenerateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      // This method doesn't exist in apiService yet, so we'll need to add it
      // For now, return null
      return null
    } catch (error) {
      console.error('Error regenerating stream key:', error)
      throw error
    }
  }

  // Save stream settings (still using localStorage for now)
  async saveStreamSettings(settings: StreamSettings): Promise<void> {
    try {
      const storedSettings = localStorage.getItem('streamSettings')
      const allSettings = storedSettings ? JSON.parse(storedSettings) : []
      
      const existingIndex = allSettings.findIndex((s: StreamSettings) => s.streamKey === settings.streamKey)
      
      if (existingIndex !== -1) {
        allSettings[existingIndex] = settings
      } else {
        allSettings.push(settings)
      }
      
      localStorage.setItem('streamSettings', JSON.stringify(allSettings))
    } catch (error) {
      console.error('Error saving stream settings:', error)
      throw error
    }
  }

  // Get stream settings
  async getStreamSettings(streamKey: string): Promise<StreamSettings | null> {
    try {
      const storedSettings = localStorage.getItem('streamSettings')
      if (!storedSettings) return null
      
      const allSettings = JSON.parse(storedSettings)
      return allSettings.find((s: StreamSettings) => s.streamKey === streamKey) || null
    } catch (error) {
      console.error('Error loading stream settings:', error)
      return null
    }
  }

  // Get all stream settings
  async getAllStreamSettings(): Promise<StreamSettings[]> {
    try {
      const storedSettings = localStorage.getItem('streamSettings')
      return storedSettings ? JSON.parse(storedSettings) : []
    } catch (error) {
      console.error('Error loading stream settings:', error)
      return []
    }
  }

  // Get all live streams (active sessions)
  async getLiveStreams() {
    try {
      return await apiService.getActiveSessions();
    } catch (error) {
      console.error('Error fetching live streams:', error);
      return [];
    }
  }

  // Get live session by stream key
  async getLiveSessionByStreamKey(streamKey: string) {
    try {
      return await apiService.getLiveSessionByStreamKey(streamKey);
    } catch (error) {
      console.error('Error fetching live session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const streamKeyService = new StreamKeyService()

// Export types for convenience
export type { StreamKey, StreamSettings } 