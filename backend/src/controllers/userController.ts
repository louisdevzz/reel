import type { Request, Response } from 'express'
import { userService } from '../services/userService'
import { redisService } from '../services/redisService'

export class UserController {
  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers()
      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }

      const user = await userService.getUserById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get user by Aptos address
  async getUserByAptosAddress(req: Request, res: Response) {
    try {
      const { address } = req.params
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Aptos address is required',
        })
      }

      const user = await userService.getUserByAptosAddress(address)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get user by username
  async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required',
        })
      }

      const user = await userService.getUserByUsername(username)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get top users by followers
  async getTopUsersByFollowers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10
      const users = await userService.getTopUsersByFollowers(limit)
      
      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top users',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const { username, fullName, email, description, avatar, aptosAddress, category, subCategory, tags, social } = req.body

      // Validate required fields
      if (!username || !fullName || !email || !description || !aptosAddress) {
        return res.status(400).json({
          success: false,
          message: 'Username, fullName, email, description, and aptosAddress are required',
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        })
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: 'Username can only contain letters, numbers, and underscores',
        })
      }

      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long',
        })
      }

      if (description.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Description must be at least 10 characters long',
        })
      }

      const user = await userService.createUser({
        username,
        fullName,
        email,
        description,
        avatar,
        aptosAddress,
        category,
        subCategory,
        tags,
        social,
      })

      res.status(201).json({
        success: true,
        data: user,
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        })
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updates = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }

      const user = await userService.updateUser(id, updates)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
      }

      const deleted = await userService.deleteUser(id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Check if user exists by Aptos address
  async checkUserExists(req: Request, res: Response) {
    try {
      const { address } = req.params
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Aptos address is required',
        })
      }

      const user = await userService.getUserByAptosAddress(address)
      res.json({
        success: true,
        data: {
          exists: !!user,
          user: user || null,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check user existence',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Search users by query
  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = req.query
      const limit = parseInt(req.query.limit as string) || 10

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        })
      }

      const users = await userService.searchUsers(q, limit)
      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Get search suggestions
  async getSearchSuggestions(req: Request, res: Response) {
    try {
      const { q } = req.query
      const limit = parseInt(req.query.limit as string) || 5

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        })
      }

      const suggestions = await userService.getSearchSuggestions(q, limit)
      res.json({
        success: true,
        data: suggestions,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Search users by category
  async searchByCategory(req: Request, res: Response) {
    try {
      const { category, subCategory } = req.query
      const limit = parseInt(req.query.limit as string) || 20

      if (!category || typeof category !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Category is required',
        })
      }

      const users = await userService.searchByCategory(category, subCategory as string, limit)
      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search by category',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Bookmark methods (shorts only)
  async addShortBookmark(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.body

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const bookmark = await userService.addShortBookmark(userId, shortId)
      res.status(201).json({
        success: true,
        data: bookmark,
        message: 'Short bookmarked successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already bookmarked')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        })
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add bookmark',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async removeShortBookmark(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.body

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const removed = await userService.removeShortBookmark(userId, shortId)
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Bookmark not found',
        })
      }

      res.json({
        success: true,
        message: 'Bookmark removed successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove bookmark',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getUserShortBookmarks(req: Request, res: Response) {
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

      const bookmarks = await userService.getUserShortBookmarks(userId, limit, offset)
      res.json({
        success: true,
        data: bookmarks,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookmarks',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async isShortBookmarked(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.query

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const isBookmarked = await userService.isShortBookmarked(userId as string, shortId as string)
      res.json({
        success: true,
        data: { isBookmarked },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check bookmark status',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Like methods for videos
  async addVideoLike(req: Request, res: Response) {
    try {
      const { userId, videoId } = req.body

      if (!userId || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Video ID are required',
        })
      }

      const like = await userService.addVideoLike(userId, videoId)
      res.status(201).json({
        success: true,
        data: like,
        message: 'Video liked successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already liked')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        })
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add like',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async removeVideoLike(req: Request, res: Response) {
    try {
      const { userId, videoId } = req.body

      if (!userId || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Video ID are required',
        })
      }

      const removed = await userService.removeVideoLike(userId, videoId)
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Like not found',
        })
      }

      res.json({
        success: true,
        message: 'Like removed successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove like',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getUserVideoLikes(req: Request, res: Response) {
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

      const likes = await userService.getUserVideoLikes(userId, limit, offset)
      res.json({
        success: true,
        data: likes,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video likes',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async isVideoLiked(req: Request, res: Response) {
    try {
      const { userId, videoId } = req.query

      if (!userId || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Video ID are required',
        })
      }

      const isLiked = await userService.isVideoLiked(userId as string, videoId as string)
      res.json({
        success: true,
        data: { isLiked },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check like status',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Like methods for shorts
  async addShortLike(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.body

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const like = await userService.addShortLike(userId, shortId)
      res.status(201).json({
        success: true,
        data: like,
        message: 'Short liked successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already liked')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        })
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add like',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async removeShortLike(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.body

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const removed = await userService.removeShortLike(userId, shortId)
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Like not found',
        })
      }

      res.json({
        success: true,
        message: 'Like removed successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove like',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async getUserShortLikes(req: Request, res: Response) {
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

      const likes = await userService.getUserShortLikes(userId, limit, offset)
      res.json({
        success: true,
        data: likes,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch short likes',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async isShortLiked(req: Request, res: Response) {
    try {
      const { userId, shortId } = req.query

      if (!userId || !shortId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Short ID are required',
        })
      }

      const isLiked = await userService.isShortLiked(userId as string, shortId as string)
      res.json({
        success: true,
        data: { isLiked },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check like status',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
} 