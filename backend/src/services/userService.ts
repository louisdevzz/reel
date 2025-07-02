import { eq, ilike, and, or, sql } from 'drizzle-orm'
import { db, users, shortBookmarks, videoLikes, shortLikes, videos, shorts, type User, type NewUser, type ShortBookmark, type VideoLike, type ShortLike } from '../../db'

interface CreateUserRequest {
  username: string
  fullName: string
  email: string
  description: string
  avatar?: string
  aptosAddress: string
  category?: string
  subCategory?: string
  tags?: string[]
  social?: {
    youtube?: string
    twitter?: string
    tiktok?: string
    twitch?: string
    instagram?: string
    website?: string
    discord?: string
    telegram?: string
    facebook?: string
    linkedin?: string
    github?: string
    other?: string
  }
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users)
    } catch (error) {
      console.error('Error fetching all users:', error)
      return []
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id))
      return result[0] || null
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
  }

  async getUserByAptosAddress(aptosAddress: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.aptosAddress, aptosAddress))
      return result[0] || null
    } catch (error) {
      console.error('Error fetching user by Aptos address:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username))
      return result[0] || null
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      // Check if username already exists
      const existingUserByUsername = await this.getUserByUsername(data.username)
      if (existingUserByUsername) {
        throw new Error('Username already exists')
      }

      // Check if aptos address already exists
      const existingUserByAddress = await this.getUserByAptosAddress(data.aptosAddress)
      if (existingUserByAddress) {
        throw new Error('User with this Aptos address already exists')
      }

      const newUser: NewUser = {
        username: data.username,
        fullName: data.fullName,
        description: data.description,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        email: data.email,
        aptosAddress: data.aptosAddress,
        category: data.category,
        subCategory: data.subCategory,
        tags: data.tags || [],
        social: data.social || {}
      }

      const result = await db.insert(users).values(newUser).returning()
      if (!result[0]) {
        throw new Error('Failed to create user')
      }
      return result[0]
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'aptosAddress' | 'joinDate'>>): Promise<User | null> {
    try {
      const result = await db.update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning()
      return result.length > 0
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Helper methods for user statistics
  async incrementUserViews(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return false

      await db.update(users)
        .set({ views: user.views + 1 })
        .where(eq(users.id, userId))
      
      return true
    } catch (error) {
      console.error('Error incrementing user views:', error)
      return false
    }
  }

  async incrementUserVideos(userId: string, isShort: boolean = false): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return false

      const updateData = isShort 
        ? { shorts: user.shorts + 1 }
        : { videos: user.videos + 1 }

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
      
      return true
    } catch (error) {
      console.error('Error incrementing user videos:', error)
      return false
    }
  }

  async updateUserFollowers(userId: string, followers: number): Promise<boolean> {
    try {
      await db.update(users)
        .set({ followers })
        .where(eq(users.id, userId))
      
      return true
    } catch (error) {
      console.error('Error updating user followers:', error)
      return false
    }
  }

  async updateUserFollowing(userId: string, following: number): Promise<boolean> {
    try {
      await db.update(users)
        .set({ following })
        .where(eq(users.id, userId))
      
      return true
    } catch (error) {
      console.error('Error updating user following:', error)
      return false
    }
  }

  async addDonation(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return false

      await db.update(users)
        .set({ 
          totalDonation: user.totalDonation + amount,
          totalDonationCount: user.totalDonationCount + 1
        })
        .where(eq(users.id, userId))
      
      return true
    } catch (error) {
      console.error('Error adding donation:', error)
      return false
    }
  }

  async getTopUsersByFollowers(limit: number = 10): Promise<User[]> {
    try {
      const result = await db.select()
        .from(users)
        .orderBy(users.followers)
        .limit(limit)
      
      return result.reverse() // Reverse to get highest first
    } catch (error) {
      console.error('Error fetching top users by followers:', error)
      return []
    }
  }

  // Search methods
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const searchTerm = `%${query}%`
      
      return await db.select()
        .from(users)
        .where(
          or(
            ilike(users.username, searchTerm),
            ilike(users.fullName, searchTerm),
            ilike(users.description, searchTerm),
            ilike(users.category, searchTerm),
            ilike(users.subCategory, searchTerm)
          )
        )
        .orderBy(users.followers)
        .limit(limit)
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<{
    users: User[]
    categories: string[]
    subCategories: string[]
  }> {
    try {
      const searchTerm = `%${query}%`
      
      // Get matching users
      const matchingUsers = await db.select()
        .from(users)
        .where(
          or(
            ilike(users.username, searchTerm),
            ilike(users.fullName, searchTerm)
          )
        )
        .orderBy(users.followers)
        .limit(limit)

      // Get matching categories
      const matchingCategories = await db.select({ category: users.category })
        .from(users)
        .where(ilike(users.category, searchTerm))
        .groupBy(users.category)
        .limit(limit)

      // Get matching subcategories
      const matchingSubCategories = await db.select({ subCategory: users.subCategory })
        .from(users)
        .where(ilike(users.subCategory, searchTerm))
        .groupBy(users.subCategory)
        .limit(limit)

      return {
        users: matchingUsers,
        categories: matchingCategories.map(c => c.category).filter(Boolean),
        subCategories: matchingSubCategories.map(sc => sc.subCategory).filter(Boolean)
      }
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return {
        users: [],
        categories: [],
        subCategories: []
      }
    }
  }

  async searchByCategory(category: string, subCategory?: string, limit: number = 20): Promise<User[]> {
    try {
      if (subCategory) {
        return await db.select()
          .from(users)
          .where(
            and(
              eq(users.category, category),
              eq(users.subCategory, subCategory)
            )
          )
          .orderBy(users.followers)
          .limit(limit)
      } else {
        return await db.select()
          .from(users)
          .where(eq(users.category, category))
          .orderBy(users.followers)
          .limit(limit)
      }
    } catch (error) {
      console.error('Error searching by category:', error)
      return []
    }
  }

  // Bookmark methods (shorts only)
  async addShortBookmark(userId: string, shortId: string): Promise<ShortBookmark | null> {
    try {
      // Start a transaction to update both bookmark table and short bookmarks count
      const result = await db.transaction(async (tx) => {
        // Add bookmark record
        const bookmarkResult = await tx.insert(shortBookmarks)
          .values({ userId, shortId })
          .returning()
        
        // Update short bookmarks count
        await tx.update(shorts)
          .set({ bookmarks: sql`${shorts.bookmarks} + 1` })
          .where(eq(shorts.id, shortId))
        
        return bookmarkResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding short bookmark:', error)
      // Check if it's a unique constraint violation
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        throw new Error('Short already bookmarked')
      }
      throw error
    }
  }

  async removeShortBookmark(userId: string, shortId: string): Promise<boolean> {
    try {
      const result = await db.transaction(async (tx) => {
        // Remove bookmark record
        const bookmarkResult = await tx.delete(shortBookmarks)
          .where(and(eq(shortBookmarks.userId, userId), eq(shortBookmarks.shortId, shortId)))
          .returning()
        
        if (bookmarkResult.length > 0) {
          // Update short bookmarks count
          await tx.update(shorts)
            .set({ bookmarks: sql`${shorts.bookmarks} - 1` })
            .where(eq(shorts.id, shortId))
        }
        
        return bookmarkResult.length > 0
      })
      
      return result
    } catch (error) {
      console.error('Error removing short bookmark:', error)
      return false
    }
  }

  async getUserShortBookmarks(userId: string, limit: number = 20, offset: number = 0): Promise<{ short: any, bookmarkedAt: Date }[]> {
    try {
      const result = await db.select({
        short: shorts,
        bookmarkedAt: shortBookmarks.createdAt
      })
        .from(shortBookmarks)
        .innerJoin(shorts, eq(shortBookmarks.shortId, shorts.id))
        .where(eq(shortBookmarks.userId, userId))
        .orderBy(shortBookmarks.createdAt)
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching user short bookmarks:', error)
      return []
    }
  }

  async isShortBookmarked(userId: string, shortId: string): Promise<boolean> {
    try {
      const result = await db.select()
        .from(shortBookmarks)
        .where(and(eq(shortBookmarks.userId, userId), eq(shortBookmarks.shortId, shortId)))
      
      return result.length > 0
    } catch (error) {
      console.error('Error checking if short is bookmarked:', error)
      return false
    }
  }

  // Like methods for videos
  async addVideoLike(userId: string, videoId: string): Promise<VideoLike | null> {
    try {
      // Start a transaction to update both like table and video likes count
      const result = await db.transaction(async (tx) => {
        // Add like record
        const likeResult = await tx.insert(videoLikes)
          .values({ userId, videoId })
          .returning()
        
        // Update video likes count
        await tx.update(videos)
          .set({ likes: sql`${videos.likes} + 1` })
          .where(eq(videos.id, videoId))
        
        return likeResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding video like:', error)
      // Check if it's a unique constraint violation
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        throw new Error('Video already liked')
      }
      throw error
    }
  }

  async removeVideoLike(userId: string, videoId: string): Promise<boolean> {
    try {
      const result = await db.transaction(async (tx) => {
        // Remove like record
        const likeResult = await tx.delete(videoLikes)
          .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
          .returning()
        
        if (likeResult.length > 0) {
          // Update video likes count
          await tx.update(videos)
            .set({ likes: sql`${videos.likes} - 1` })
            .where(eq(videos.id, videoId))
        }
        
        return likeResult.length > 0
      })
      
      return result
    } catch (error) {
      console.error('Error removing video like:', error)
      return false
    }
  }

  async getUserVideoLikes(userId: string, limit: number = 20, offset: number = 0): Promise<{ video: any, likedAt: Date }[]> {
    try {
      const result = await db.select({
        video: videos,
        likedAt: videoLikes.createdAt
      })
        .from(videoLikes)
        .innerJoin(videos, eq(videoLikes.videoId, videos.id))
        .where(eq(videoLikes.userId, userId))
        .orderBy(videoLikes.createdAt)
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching user video likes:', error)
      return []
    }
  }

  async isVideoLiked(userId: string, videoId: string): Promise<boolean> {
    try {
      const result = await db.select()
        .from(videoLikes)
        .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
      
      return result.length > 0
    } catch (error) {
      console.error('Error checking if video is liked:', error)
      return false
    }
  }

  // Like methods for shorts
  async addShortLike(userId: string, shortId: string): Promise<ShortLike | null> {
    try {
      // Start a transaction to update both like table and short likes count
      const result = await db.transaction(async (tx) => {
        // Add like record
        const likeResult = await tx.insert(shortLikes)
          .values({ userId, shortId })
          .returning()
        
        // Update short likes count
        await tx.update(shorts)
          .set({ likes: sql`${shorts.likes} + 1` })
          .where(eq(shorts.id, shortId))
        
        return likeResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding short like:', error)
      // Check if it's a unique constraint violation
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        throw new Error('Short already liked')
      }
      throw error
    }
  }

  async removeShortLike(userId: string, shortId: string): Promise<boolean> {
    try {
      const result = await db.transaction(async (tx) => {
        // Remove like record
        const likeResult = await tx.delete(shortLikes)
          .where(and(eq(shortLikes.userId, userId), eq(shortLikes.shortId, shortId)))
          .returning()
        
        if (likeResult.length > 0) {
          // Update short likes count
          await tx.update(shorts)
            .set({ likes: sql`${shorts.likes} - 1` })
            .where(eq(shorts.id, shortId))
        }
        
        return likeResult.length > 0
      })
      
      return result
    } catch (error) {
      console.error('Error removing short like:', error)
      return false
    }
  }

  async getUserShortLikes(userId: string, limit: number = 20, offset: number = 0): Promise<{ short: any, likedAt: Date }[]> {
    try {
      const result = await db.select({
        short: shorts,
        likedAt: shortLikes.createdAt
      })
        .from(shortLikes)
        .innerJoin(shorts, eq(shortLikes.shortId, shorts.id))
        .where(eq(shortLikes.userId, userId))
        .orderBy(shortLikes.createdAt)
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching user short likes:', error)
      return []
    }
  }

  async isShortLiked(userId: string, shortId: string): Promise<boolean> {
    try {
      const result = await db.select()
        .from(shortLikes)
        .where(and(eq(shortLikes.userId, userId), eq(shortLikes.shortId, shortId)))
      
      return result.length > 0
    } catch (error) {
      console.error('Error checking if short is liked:', error)
      return false
    }
  }
}

export const userService = new UserService() 