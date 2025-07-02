import type { Request, Response } from 'express'
import { shareService } from '../services/shareService'
// import { redisService } from '../services/redisService' // No longer needed for share

export class ShareController {
  // Video Shares
  async addVideoShare(req: Request, res: Response) {
    try {
      const { videoId } = req.params
      const { userId, platform, shareUrl } = req.body

      if (!userId || !platform || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, platform, and video ID are required',
        })
      }

      // Rate limiting removed for better user experience
      const share = await shareService.addVideoShare(videoId, {
        userId,
        platform,
        shareUrl,
      })

      res.status(201).json({
        success: true,
        data: share,
        message: 'Share recorded successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to record share',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getVideoShares(req: Request, res: Response) {
    try {
      const { videoId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required',
        })
      }

      const shares = await shareService.getVideoShares(videoId, limit, offset)
      res.json({
        success: true,
        data: shares,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shares',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getVideoShareStats(req: Request, res: Response) {
    try {
      const { videoId } = req.params

      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required',
        })
      }

      const stats = await shareService.getShareStats(videoId, 'video')
      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch share statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getUserVideoShares(req: Request, res: Response) {
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

      const shares = await shareService.getUserVideoShares(userId, limit, offset)
      res.json({
        success: true,
        data: shares,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user video shares',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Short Shares
  async addShortShare(req: Request, res: Response) {
    try {
      const { shortId } = req.params
      const { userId, platform, shareUrl } = req.body

      if (!userId || !platform || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, platform, and short ID are required',
        })
      }

      // Rate limiting removed for better user experience
      const share = await shareService.addShortShare(shortId, {
        userId,
        platform,
        shareUrl,
      })

      res.status(201).json({
        success: true,
        data: share,
        message: 'Share recorded successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to record share',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getShortShares(req: Request, res: Response) {
    try {
      const { shortId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      if (!shortId) {
        return res.status(400).json({
          success: false,
          message: 'Short ID is required',
        })
      }

      const shares = await shareService.getShortShares(shortId, limit, offset)
      res.json({
        success: true,
        data: shares,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shares',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getShortShareStats(req: Request, res: Response) {
    try {
      const { shortId } = req.params

      if (!shortId) {
        return res.status(400).json({
          success: false,
          message: 'Short ID is required',
        })
      }

      const stats = await shareService.getShareStats(shortId, 'short')
      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch share statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getUserShortShares(req: Request, res: Response) {
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

      const shares = await shareService.getUserShortShares(userId, limit, offset)
      res.json({
        success: true,
        data: shares,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user short shares',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
} 