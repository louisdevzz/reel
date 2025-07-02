import type { Request, Response } from 'express'
import { viewService } from '../services/viewService'
import { redisService } from '../services/redisService'
import { v4 as uuidv4 } from 'uuid'

export class ViewController {
  // Track initial view (ping)
  async trackView(req: Request, res: Response) {
    try {
      const { contentId } = req.params
      const { userId, sessionId, ipAddress, userAgent } = req.body

      if (!contentId || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Content ID and session ID are required',
        })
      }

      // Extract content type from URL path
      const contentType = req.path.includes('/videos/') ? 'videos' : 'shorts'

      // Validate content type
      if (contentType !== 'videos' && contentType !== 'shorts') {
        return res.status(400).json({
          success: false,
          message: 'Invalid content type. Must be "videos" or "shorts"',
        })
      }

      const type = contentType === 'videos' ? 'video' : 'short'
      const viewId = uuidv4()

      // Create initial view data
      const viewData = {
        viewId,
        userId: userId || null,
        sessionId,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.get('User-Agent'),
        watchDuration: 0,
        isCompleted: false,
        timestamp: Date.now()
      }

      // Store in Redis for temporary tracking
      await redisService.addTemporaryView(contentId, type, sessionId, viewData)

      // Store viewId mapping
      await redisService.setViewIdMap(viewId, { contentId, contentType: type, sessionId })

      // Add to processing queue
      await redisService.addToViewQueue(contentId, type, viewData)

      res.status(201).json({
        success: true,
        data: { viewId },
        message: 'View tracked successfully',
      })
    } catch (error) {
      console.error('Error tracking view:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to track view',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Update view progress
  async updateView(req: Request, res: Response) {
    try {
      const { viewId } = req.params
      const { watchDuration, isCompleted } = req.body

      if (!viewId) {
        return res.status(400).json({
          success: false,
          message: 'View ID is required',
        })
      }

      // Lấy mapping từ Redis
      const mapping = await redisService.getViewIdMap(viewId)
      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: 'View not found or expired',
        })
      }
      const { contentId, contentType, sessionId } = mapping

      // Update in Redis
      const updated = await redisService.updateTemporaryView(
        contentId,
        contentType,
        sessionId,
        { watchDuration, isCompleted }
      )

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'View not found or expired',
        })
      }

      res.json({
        success: true,
        message: 'View updated successfully',
      })
    } catch (error) {
      console.error('Error updating view:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update view',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get view statistics
  async getViewStats(req: Request, res: Response) {
    try {
      const { contentId } = req.params

      if (!contentId) {
        return res.status(400).json({
          success: false,
          message: 'Content ID is required',
        })
      }

      // Extract content type from URL path
      const contentType = req.path.includes('/videos/') ? 'videos' : 'shorts'
      const type = contentType === 'videos' ? 'video' : 'short'

      // Try to get from cache first
      let stats = await redisService.getCachedAnalytics(contentId, type)

      if (!stats) {
        // Get from database
        stats = await viewService.getViewStats(contentId, type)
        
        // Cache the result
        await redisService.cacheAnalytics(contentId, type, stats)
      }

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error getting view stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get view statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get view history for a user
  async getUserViewHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }

      const history = await viewService.getUserViewHistory(userId, limit, offset)

      res.json({
        success: true,
        data: history,
      })
    } catch (error) {
      console.error('Error getting user view history:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get view history',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get views for a specific content
  async getContentViews(req: Request, res: Response) {
    try {
      const { contentId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      if (!contentId) {
        return res.status(400).json({
          success: false,
          message: 'Content ID is required',
        })
      }

      // Extract content type from URL path
      const contentType = req.path.includes('/videos/') ? 'videos' : 'shorts'
      const type = contentType === 'videos' ? 'video' : 'short'
      const views = type === 'video' 
        ? await viewService.getVideoViews(contentId, limit, offset)
        : await viewService.getShortViews(contentId, limit, offset)

      res.json({
        success: true,
        data: views,
      })
    } catch (error) {
      console.error('Error getting content views:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get content views',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Process view queue (for background workers)
  async processViewQueue(req: Request, res: Response) {
    try {
      // Extract content type from URL path
      const contentType = req.path.includes('/videos/') ? 'videos' : 'shorts'
      const type = contentType === 'videos' ? 'video' : 'short'
      
      const queueItem = await redisService.getFromViewQueue(type)
      
      if (!queueItem) {
        return res.json({
          success: true,
          data: null,
          message: 'No items in queue',
        })
      }

      const { contentId, data } = queueItem

      // Validate view (basic validation)
      if (await this.isValidView(contentId, data)) {
        // Add to database
        if (type === 'video') {
          await viewService.addVideoView(contentId, {
            userId: data.userId,
            sessionId: data.sessionId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            watchDuration: data.watchDuration,
            isCompleted: data.isCompleted,
          })
        } else {
          await viewService.addShortView(contentId, {
            userId: data.userId,
            sessionId: data.sessionId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            watchDuration: data.watchDuration,
            isCompleted: data.isCompleted,
          })
        }

        // Remove from temporary storage
        await redisService.removeTemporaryView(contentId, type, data.sessionId)
      }

      res.json({
        success: true,
        data: queueItem,
        message: 'View processed successfully',
      })
    } catch (error) {
      console.error('Error processing view queue:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to process view queue',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Health check for Redis
  async healthCheck(req: Request, res: Response) {
    try {
      const redisHealth = await redisService.ping()
      
      res.json({
        success: true,
        data: {
          redis: redisHealth,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Health check failed:', error)
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Private method to validate views
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

    return true
  }
} 