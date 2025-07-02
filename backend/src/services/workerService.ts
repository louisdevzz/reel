import { redisService } from './redisService'
import { viewService } from './viewService'
import { analyticsService } from '../services/analyticsService'

class WorkerService {
  private isRunning = false
  private intervals: NodeJS.Timeout[] = []

  // Start background workers
  async startWorkers() {
    if (this.isRunning) {
      console.log('Workers already running')
      return
    }

    this.isRunning = true
    console.log('Starting background workers...')

    // Start video view queue processor
    const videoViewInterval = setInterval(async () => {
      await this.processVideoViewQueue()
    }, 5000) // Process every 5 seconds

    // Start short view queue processor
    const shortViewInterval = setInterval(async () => {
      await this.processShortViewQueue()
    }, 5000) // Process every 5 seconds

    this.intervals.push(videoViewInterval, shortViewInterval)
  }

  // Stop background workers
  stopWorkers() {
    if (!this.isRunning) {
      console.log('Workers not running')
      return
    }

    this.isRunning = false
    console.log('Stopping background workers...')

    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
  }

  // Process video view queue
  private async processVideoViewQueue() {
    try {
      const queueItem = await redisService.getFromViewQueue('video')
      
      if (!queueItem) {
        return // No items in queue
      }

      const { contentId, data } = queueItem

      // Validate view
      if (await this.isValidView(contentId, data)) {
        // Add to database
        await viewService.addVideoView(contentId, {
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          watchDuration: data.watchDuration,
          isCompleted: data.isCompleted,
        })

        // Remove from temporary storage
        await redisService.removeTemporaryView(contentId, 'video', data.sessionId)

        // Update analytics
        await analyticsService.trackView(contentId, 'video', data)

        console.log(`Processed video view: ${contentId}`)
      } else {
        console.log(`Invalid video view rejected: ${contentId}`)
      }
    } catch (error) {
      console.error('Error processing video view queue:', error)
    }
  }

  // Process short view queue
  private async processShortViewQueue() {
    try {
      const queueItem = await redisService.getFromViewQueue('short')
      
      if (!queueItem) {
        return // No items in queue
      }

      const { contentId, data } = queueItem

      // Validate view
      if (await this.isValidView(contentId, data)) {
        // Add to database
        await viewService.addShortView(contentId, {
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          watchDuration: data.watchDuration,
          isCompleted: data.isCompleted,
        })

        // Remove from temporary storage
        await redisService.removeTemporaryView(contentId, 'short', data.sessionId)

        // Update analytics
        await analyticsService.trackView(contentId, 'short', data)

        console.log(`Processed short view: ${contentId}`)
      } else {
        console.log(`Invalid short view rejected: ${contentId}`)
      }
    } catch (error) {
      console.error('Error processing short view queue:', error)
    }
  }

  // Validate view data
  private async isValidView(contentId: string, data: any): Promise<boolean> {
    // Basic validation rules
    if (!data.sessionId || !data.ipAddress) {
      return false
    }

    // Check for minimum watch duration (10 seconds for valid view)
    if (data.watchDuration && data.watchDuration < 10) {
      return false
    }

    // Check for suspicious patterns (basic bot detection)
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ]

    if (data.userAgent && suspiciousPatterns.some(pattern => pattern.test(data.userAgent))) {
      return false
    }

    // Check for duplicate views from same session
    const existingView = await redisService.getTemporaryView(contentId, data.contentType || 'video', data.sessionId)
    if (existingView && existingView.timestamp > data.timestamp - 60000) { // Within 1 minute
      return false
    }

    return true
  }

  // Get worker status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.length,
    }
  }
}

export const workerService = new WorkerService() 