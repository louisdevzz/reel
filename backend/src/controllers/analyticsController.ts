import type { Request, Response } from 'express'
import { analyticsService } from '../services/analyticsService'

export class AnalyticsController {
  // Get content analytics
  async getContentAnalytics(req: Request, res: Response) {
    try {
      const { contentType, contentId } = req.params
      
      if (!contentId) {
        return res.status(400).json({
          success: false,
          message: 'Content ID is required',
        })
      }

      const type = contentType === 'videos' ? 'video' : 'short'
      const analytics = await analyticsService.getContentAnalytics(contentId, type)

      if (!analytics) {
        return res.status(404).json({
          success: false,
          message: 'Analytics not found',
        })
      }

      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      console.error('Error getting content analytics:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get content analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get user analytics
  async getUserAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }

      const analytics = await analyticsService.getUserAnalytics(userId)

      if (!analytics) {
        return res.status(404).json({
          success: false,
          message: 'User analytics not found',
        })
      }

      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      console.error('Error getting user analytics:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get user analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(req: Request, res: Response) {
    try {
      const analytics = await analyticsService.getPlatformAnalytics()

      if (!analytics) {
        return res.status(404).json({
          success: false,
          message: 'Platform analytics not found',
        })
      }

      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      console.error('Error getting platform analytics:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get platform analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
} 