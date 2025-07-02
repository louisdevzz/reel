import { eq, ilike, and, or } from 'drizzle-orm'
import { db, users, type User, type NewUser } from '../../db'

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
}

export const userService = new UserService() 