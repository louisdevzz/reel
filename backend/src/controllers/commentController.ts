import type { Request, Response } from 'express'
import { commentService } from '../services/commentService'
import { redisService } from '../services/redisService'

export class CommentController {
  // Video Comments
  async addVideoComment(req: Request, res: Response) {
    try {
      const { videoId } = req.params
      const { userId, content, parentId } = req.body

      if (!userId || !content || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, content, and video ID are required',
        })
      }

      if (content.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty',
        })
      }

      if (content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot exceed 1000 characters',
        })
      }

      // Rate limiting removed for better user experience

      const comment = await commentService.addVideoComment(videoId, {
        userId,
        content,
        parentId,
      })

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async removeVideoComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params
      const { userId } = req.body

      if (!userId || !commentId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and comment ID are required',
        })
      }

      const removed = await commentService.removeVideoComment(commentId, userId)
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you do not have permission to delete it',
        })
      }

      res.json({
        success: true,
        message: 'Comment removed successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getVideoComments(req: Request, res: Response) {
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

      const comments = await commentService.getVideoComments(videoId, limit, offset)
      res.json({
        success: true,
        data: comments,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async updateVideoComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params
      const { userId, content } = req.body

      if (!userId || !content || !commentId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, content, and comment ID are required',
        })
      }

      if (content.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty',
        })
      }

      if (content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot exceed 1000 characters',
        })
      }

      const comment = await commentService.updateVideoComment(commentId, userId, content)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you do not have permission to edit it',
        })
      }

      res.json({
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Short Comments
  async addShortComment(req: Request, res: Response) {
    try {
      const { shortId } = req.params
      const { userId, content, parentId } = req.body

      if (!userId || !content || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, content, and short ID are required',
        })
      }

      if (content.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty',
        })
      }

      if (content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot exceed 1000 characters',
        })
      }

      // Rate limiting removed for better user experience

      const comment = await commentService.addShortComment(shortId, {
        userId,
        content,
        parentId,
      })

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async removeShortComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params
      const { userId } = req.body

      if (!userId || !commentId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and comment ID are required',
        })
      }

      const removed = await commentService.removeShortComment(commentId, userId)
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you do not have permission to delete it',
        })
      }

      res.json({
        success: true,
        message: 'Comment removed successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getShortComments(req: Request, res: Response) {
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

      const comments = await commentService.getShortComments(shortId, limit, offset)
      res.json({
        success: true,
        data: comments,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async updateShortComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params
      const { userId, content } = req.body

      if (!userId || !content || !commentId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, content, and comment ID are required',
        })
      }

      if (content.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty',
        })
      }

      if (content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot exceed 1000 characters',
        })
      }

      const comment = await commentService.updateShortComment(commentId, userId, content)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found or you do not have permission to edit it',
        })
      }

      res.json({
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}