const API_BASE_URL = process.env.PUBLIC_API_URL+'/api' || 'http://localhost:3001/api'

class ViewTrackingService {
  private sessionId: string
  private currentViewId: string | null = null
  private updateInterval: ReturnType<typeof setInterval> | null = null
  private startTime: number = 0

  constructor() {
    // Generate a unique session ID for this browser session
    this.sessionId = this.generateSessionId()
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `${timestamp}-${random}`
  }

  // Start tracking a view
  async startTracking(contentId: string, contentType: 'videos' | 'shorts', userId?: string) {
    try {
      this.startTime = Date.now()
      
      // Send initial view ping
      const response = await fetch(`${API_BASE_URL}/views/${contentType}/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId: this.sessionId,
          ipAddress: await this.getClientIP(),
          userAgent: navigator.userAgent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.currentViewId = data.data.viewId
        
        // Start periodic updates
        this.startPeriodicUpdates(contentId, contentType)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error starting view tracking:', error)
      return false
    }
  }

  // Stop tracking current view
  async stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    
    this.currentViewId = null
    this.startTime = 0
  }

  // Update view progress
  async updateViewProgress(watchDuration: number, isCompleted: boolean = false) {
    if (!this.currentViewId) return

    try {
      await fetch(`${API_BASE_URL}/views/${this.currentViewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchDuration,
          isCompleted,
        }),
      })
    } catch (error) {
      console.error('Error updating view progress:', error)
    }
  }

  // Start periodic updates
  private startPeriodicUpdates(contentId: string, contentType: 'videos' | 'shorts') {
    this.updateInterval = setInterval(async () => {
      const currentTime = Date.now()
      const watchDuration = Math.floor((currentTime - this.startTime) / 1000)
      
      await this.updateViewProgress(watchDuration)
    }, 5000) // Update every 5 seconds
  }

  // Mark view as completed
  async markAsCompleted() {
    if (!this.currentViewId) return

    const watchDuration = Math.floor((Date.now() - this.startTime) / 1000)
    await this.updateViewProgress(watchDuration, true)
  }

  // Get client IP from our backend
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/client-ip`)
      if (response.ok) {
        const data = await response.json()
        return data.ip || 'unknown'
      }
    } catch (error) {
      console.error('Error getting client IP from backend:', error)
    }
    
    // Fallback: return unknown since we can't reliably get IP from frontend
    // due to CORS restrictions on external IP services
    return 'unknown'
  }

  // Get view statistics
  async getViewStats(contentId: string, contentType: 'videos' | 'shorts') {
    try {
      const response = await fetch(`${API_BASE_URL}/views/${contentType}/${contentId}/stats`)
      if (response.ok) {
        const data = await response.json()
        return data.data
      }
      return null
    } catch (error) {
      console.error('Error getting view stats:', error)
      return null
    }
  }

  // Get user view history
  async getUserViewHistory(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/views/user/${userId}/history?limit=${limit}&offset=${offset}`
      )
      if (response.ok) {
        const data = await response.json()
        return data.data
      }
      return []
    } catch (error) {
      console.error('Error getting user view history:', error)
      return []
    }
  }

  // Track engagement actions (like, comment, share)
  async trackEngagement(action: 'like' | 'comment' | 'share', contentId: string, contentType: 'videos' | 'shorts', userId: string, data?: any) {
    try {
      let endpoint = ''
      let method = 'POST'
      let body: any = { userId }

      switch (action) {
        case 'like':
          endpoint = `${API_BASE_URL}/users/likes/${contentType}`
          body = { userId, [`${contentType.slice(0, -1)}Id`]: contentId }
          break
        case 'comment':
          endpoint = `${API_BASE_URL}/comments/${contentType}/${contentId}`
          body = { userId, content: data.content, parentId: data.parentId }
          break
        case 'share':
          endpoint = `${API_BASE_URL}/shares/${contentType}/${contentId}`
          body = { userId, platform: data.platform, shareUrl: data.shareUrl }
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`${action} tracked successfully:`, result)
        return result.data
      } else if (response.status === 429) {
        console.warn('Rate limit exceeded for', action)
        return null
      } else {
        console.error(`Failed to track ${action}:`, response.statusText)
        return null
      }
    } catch (error) {
      console.error(`Error tracking ${action}:`, error)
      return null
    }
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId
  }

  // Check if currently tracking
  isTracking(): boolean {
    return this.currentViewId !== null
  }
}

export const viewTrackingService = new ViewTrackingService() 