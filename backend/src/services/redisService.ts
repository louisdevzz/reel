import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

class RedisService {
  private client: ReturnType<typeof createClient>
  private isConnected = false

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
      this.isConnected = false
    })

    this.client.on('connect', () => {
      console.log('Redis Client Connected')
      this.isConnected = true
    })

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected')
      this.isConnected = false
    })
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect()
      } catch (error) {
        console.error('Failed to connect to Redis:', error)
        // Fallback to in-memory storage if Redis is not available
        return false
      }
    }
    return this.isConnected
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect()
    }
  }

  // View tracking methods
  async addTemporaryView(contentId: string, contentType: 'video' | 'short', sessionId: string, data: any) {
    try {
      await this.connect()
      const key = `view:${contentType}:${contentId}:${sessionId}`
      const ttl = 60 // 1 minute
      await this.client.setEx(key, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error adding temporary view:', error)
      return false
    }
  }

  async getTemporaryView(contentId: string, contentType: 'video' | 'short', sessionId: string) {
    try {
      await this.connect()
      const key = `view:${contentType}:${contentId}:${sessionId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting temporary view:', error)
      return null
    }
  }

  async updateTemporaryView(contentId: string, contentType: 'video' | 'short', sessionId: string, data: any) {
    try {
      await this.connect()
      const key = `view:${contentType}:${contentId}:${sessionId}`
      const existing = await this.client.get(key)
      if (existing) {
        const existingData = JSON.parse(existing)
        const updatedData = { ...existingData, ...data }
        const ttl = 60 // 1 minute
        await this.client.setEx(key, ttl, JSON.stringify(updatedData))
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating temporary view:', error)
      return false
    }
  }

  async removeTemporaryView(contentId: string, contentType: 'video' | 'short', sessionId: string) {
    try {
      await this.connect()
      const key = `view:${contentType}:${contentId}:${sessionId}`
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Error removing temporary view:', error)
      return false
    }
  }

  // Cache methods for frequently accessed data
  async cacheUserData(userId: string, data: any, ttl: number = 3600) {
    try {
      await this.connect()
      const key = `user:${userId}`
      await this.client.setEx(key, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error caching user data:', error)
      return false
    }
  }

  async getCachedUserData(userId: string) {
    try {
      await this.connect()
      const key = `user:${userId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting cached user data:', error)
      return null
    }
  }

  async cacheVideoData(videoId: string, data: any, ttl: number = 1800) {
    try {
      await this.connect()
      const key = `video:${videoId}`
      await this.client.setEx(key, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error caching video data:', error)
      return false
    }
  }

  async getCachedVideoData(videoId: string) {
    try {
      await this.connect()
      const key = `video:${videoId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting cached video data:', error)
      return null
    }
  }

  // Queue methods for processing views
  async addToViewQueue(contentId: string, contentType: 'video' | 'short', data: any) {
    try {
      await this.connect()
      const queueKey = `view_queue:${contentType}`
      await this.client.lPush(queueKey, JSON.stringify({
        contentId,
        contentType,
        data,
        timestamp: Date.now()
      }))
      return true
    } catch (error) {
      console.error('Error adding to view queue:', error)
      return false
    }
  }

  async getFromViewQueue(contentType: 'video' | 'short') {
    try {
      await this.connect()
      const queueKey = `view_queue:${contentType}`
      const item = await this.client.rPop(queueKey)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting from view queue:', error)
      return null
    }
  }

  // Analytics cache
  async cacheAnalytics(contentId: string, contentType: 'video' | 'short', data: any, ttl: number = 3600) {
    try {
      await this.connect()
      const key = `analytics:${contentType}:${contentId}`
      await this.client.setEx(key, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error caching analytics:', error)
      return false
    }
  }

  async getCachedAnalytics(contentId: string, contentType: 'video' | 'short') {
    try {
      await this.connect()
      const key = `analytics:${contentType}:${contentId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting cached analytics:', error)
      return null
    }
  }

  // Health check
  async ping() {
    try {
      await this.connect()
      const result = await this.client.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis ping failed:', error)
      return false
    }
  }

  // Chat methods
  async addChatMessage(streamKey: string, messageData: string) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      await this.client.lPush(key, messageData)
      return true
    } catch (error) {
      console.error('Error adding chat message:', error)
      return false
    }
  }

  async getChatMessages(streamKey: string, start: number = 0, end: number = -1) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      const messages = await this.client.lRange(key, start, end)
      return messages
    } catch (error) {
      console.error('Error getting chat messages:', error)
      return []
    }
  }

  async trimChatMessages(streamKey: string, start: number = 0, end: number) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      await this.client.lTrim(key, start, end)
      return true
    } catch (error) {
      console.error('Error trimming chat messages:', error)
      return false
    }
  }

  async setChatTTL(streamKey: string, ttl: number) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      await this.client.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Error setting chat TTL:', error)
      return false
    }
  }

  async getChatMessageCount(streamKey: string) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      return await this.client.lLen(key)
    } catch (error) {
      console.error('Error getting chat message count:', error)
      return 0
    }
  }

  async deleteChatMessages(streamKey: string) {
    try {
      await this.connect()
      const key = `chat:${streamKey}`
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Error deleting chat messages:', error)
      return false
    }
  }

  // Mapping viewId <-> (contentId, contentType, sessionId)
  async setViewIdMap(viewId: string, data: { contentId: string, contentType: 'video' | 'short', sessionId: string }) {
    try {
      await this.connect()
      const key = `viewidmap:${viewId}`
      await this.client.setEx(key, 60, JSON.stringify(data)) // TTL 1 phút
      return true
    } catch (error) {
      console.error('Error setting viewId map:', error)
      return false
    }
  }

  async getViewIdMap(viewId: string): Promise<{ contentId: string, contentType: 'video' | 'short', sessionId: string } | null> {
    try {
      await this.connect()
      const key = `viewidmap:${viewId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting viewId map:', error)
      return null
    }
  }
}

export const redisService = new RedisService() 