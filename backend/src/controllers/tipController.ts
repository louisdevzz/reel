import type { Request, Response } from 'express'
import { tipService } from '../services/tipService'
import { z } from 'zod'

// Validation schemas
const createTipSchema = z.object({
  receiverId: z.string().uuid(),
  tipperId: z.string().uuid(),
  amount: z.number().positive(),
  message: z.string().optional(),
  tipType: z.enum(['general', 'stream', 'video', 'short']).default('general'),
  streamSessionId: z.string().uuid().optional(),
  videoId: z.string().uuid().optional(),
  shortId: z.string().uuid().optional(),
  txHash: z.string().optional(),
})

const updateTipStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'failed']),
})

const updateTipTxHashSchema = z.object({
  txHash: z.string().min(1, 'Transaction hash is required'),
})

export class TipController {
  // Create a new tip
  async createTip(req: Request, res: Response) {
    try {
      const validation = createTipSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validation.error.errors,
        })
      }

      const { receiverId, amount, message, tipType, streamSessionId, videoId, shortId, txHash, tipperId } = validation.data

      if (!tipperId) {
        return res.status(400).json({
          success: false,
          message: 'tipperId is required',
        })
      }

      if (tipperId === receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot tip yourself',
        })
      }

      const tip = await tipService.createTip({
        tipperId,
        receiverId,
        amount,
        message,
        txHash: txHash || '',
        status: 'pending',
        tipType,
        streamSessionId,
        videoId,
        shortId,
      })

      res.status(201).json({
        success: true,
        message: 'Tip created successfully',
        data: tip,
      })
    } catch (error) {
      console.error('Error creating tip:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tip by ID
  async getTipById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Tip ID is required',
        })
      }
      
      const tip = await tipService.getTipById(id)

      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip not found',
        })
      }

      res.json({
        success: true,
        data: tip,
      })
    } catch (error) {
      console.error('Error getting tip:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tips sent by user
  async getTipsSentByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.query.userId as string
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required',
        })
      }

      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      const tips = await tipService.getTipsSentByUser(userId, limit, offset)

      res.json({
        success: true,
        data: tips,
        pagination: {
          limit,
          offset,
          count: tips.length,
        },
      })
    } catch (error) {
      console.error('Error getting tips sent by user:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tips received by user
  async getTipsReceivedByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.query.userId as string
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required',
        })
      }

      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      const tips = await tipService.getTipsReceivedByUser(userId, limit, offset)

      res.json({
        success: true,
        data: tips,
        pagination: {
          limit,
          offset,
          count: tips.length,
        },
      })
    } catch (error) {
      console.error('Error getting tips received by user:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tips for a stream session
  async getTipsForStreamSession(req: Request, res: Response) {
    try {
      const { streamSessionId } = req.params
      if (!streamSessionId) {
        return res.status(400).json({
          success: false,
          message: 'Stream session ID is required',
        })
      }
      
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const tips = await tipService.getTipsForStreamSession(streamSessionId, limit, offset)

      res.json({
        success: true,
        data: tips,
        pagination: {
          limit,
          offset,
          count: tips.length,
        },
      })
    } catch (error) {
      console.error('Error getting tips for stream session:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tips for a video
  async getTipsForVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required',
        })
      }
      
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const tips = await tipService.getTipsForVideo(videoId, limit, offset)

      res.json({
        success: true,
        data: tips,
        pagination: {
          limit,
          offset,
          count: tips.length,
        },
      })
    } catch (error) {
      console.error('Error getting tips for video:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get tips for a short
  async getTipsForShort(req: Request, res: Response) {
    try {
      const { shortId } = req.params
      if (!shortId) {
        return res.status(400).json({
          success: false,
          message: 'Short ID is required',
        })
      }
      
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const tips = await tipService.getTipsForShort(shortId, limit, offset)

      res.json({
        success: true,
        data: tips,
        pagination: {
          limit,
          offset,
          count: tips.length,
        },
      })
    } catch (error) {
      console.error('Error getting tips for short:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Update tip status
  async updateTipStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Tip ID is required',
        })
      }
      
      const validation = updateTipStatusSchema.safeParse(req.body)
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validation.error.errors,
        })
      }

      const { status } = validation.data
      const updatedTip = await tipService.updateTipStatus(id, status)

      if (!updatedTip) {
        return res.status(404).json({
          success: false,
          message: 'Tip not found',
        })
      }

      res.json({
        success: true,
        message: 'Tip status updated successfully',
        data: updatedTip,
      })
    } catch (error) {
      console.error('Error updating tip status:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Update tip transaction hash
  async updateTipTxHash(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Tip ID is required',
        })
      }

      const validation = updateTipTxHashSchema.safeParse(req.body)

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validation.error.errors,
        })
      }

      const { txHash } = validation.data
      const updatedTip = await tipService.updateTipTxHash(id, txHash)

      if (!updatedTip) {
        return res.status(404).json({
          success: false,
          message: 'Tip not found',
        })
      }

      res.json({
        success: true,
        message: 'Tip transaction hash updated successfully',
        data: updatedTip,
      })
    } catch (error) {
      console.error('Error updating tip transaction hash:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Confirm tip and update stats
  async confirmTipAndUpdateStats(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Tip ID is required',
        })
      }

      const result = await tipService.confirmTipAndUpdateStats(id)

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to confirm tip',
        })
      }

      res.json({
        success: true,
        message: 'Tip confirmed and stats updated successfully',
      })
    } catch (error) {
      console.error('Error confirming tip and updating stats:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get user tip statistics
  async getUserTipStats(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.query.userId as string
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required',
        })
      }

      const stats = await tipService.getUserTipStats(userId)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error getting user tip stats:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Get recent tips
  async getRecentTips(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const tips = await tipService.getRecentTipsWithUsers(limit)

      res.json({
        success: true,
        data: tips,
      })
    } catch (error) {
      console.error('Error getting recent tips:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  // Delete tip (admin only)
  async deleteTip(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Tip ID is required',
        })
      }
      
      // TODO: Add admin check here
      const deleted = await tipService.deleteTip(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Tip not found',
        })
      }

      res.json({
        success: true,
        message: 'Tip deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting tip:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}

export const tipController = new TipController() 