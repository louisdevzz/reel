import { eq, and, desc, sql } from 'drizzle-orm'
import { db, videoShares, shortShares, videos, shorts, users, type VideoShare, type ShortShare, type NewVideoShare, type NewShortShare } from '../../db'

interface CreateShareRequest {
  userId: string
  platform: string
  shareUrl?: string
}

class ShareService {
  // Video Shares
  async addVideoShare(videoId: string, data: CreateShareRequest): Promise<VideoShare | null> {
    try {
      const newShare: NewVideoShare = {
        userId: data.userId,
        videoId,
        platform: data.platform,
        shareUrl: data.shareUrl || null,
      }

      const result = await db.transaction(async (tx) => {
        // Add share record
        const shareResult = await tx.insert(videoShares)
          .values(newShare)
          .returning()
        
        // Update video share count
        await tx.update(videos)
          .set({ shares: sql`${videos.shares} + 1` })
          .where(eq(videos.id, videoId))
        
        return shareResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding video share:', error)
      throw error
    }
  }

  async getVideoShares(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        share: videoShares,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(videoShares)
        .innerJoin(users, eq(videoShares.userId, users.id))
        .where(eq(videoShares.videoId, videoId))
        .orderBy(desc(videoShares.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching video shares:', error)
      return []
    }
  }

  async getUserVideoShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        share: videoShares,
        video: {
          id: videos.id,
          title: videos.title,
          thumbnail: videos.thumbnail,
          views: videos.views,
          likes: videos.likes,
          shares: videos.shares,
          uploadDate: videos.uploadDate
        }
      })
        .from(videoShares)
        .innerJoin(videos, eq(videoShares.videoId, videos.id))
        .where(eq(videoShares.userId, userId))
        .orderBy(desc(videoShares.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching user video shares:', error)
      return []
    }
  }

  // Short Shares
  async addShortShare(shortId: string, data: CreateShareRequest): Promise<ShortShare | null> {
    try {
      const newShare: NewShortShare = {
        userId: data.userId,
        shortId,
        platform: data.platform,
        shareUrl: data.shareUrl || null,
      }

      const result = await db.transaction(async (tx) => {
        // Add share record
        const shareResult = await tx.insert(shortShares)
          .values(newShare)
          .returning()
        
        // Update short share count
        await tx.update(shorts)
          .set({ shares: sql`${shorts.shares} + 1` })
          .where(eq(shorts.id, shortId))
        
        return shareResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding short share:', error)
      throw error
    }
  }

  async getShortShares(shortId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        share: shortShares,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(shortShares)
        .innerJoin(users, eq(shortShares.userId, users.id))
        .where(eq(shortShares.shortId, shortId))
        .orderBy(desc(shortShares.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching short shares:', error)
      return []
    }
  }

  async getUserShortShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        share: shortShares,
        short: {
          id: shorts.id,
          title: shorts.title,
          thumbnail: shorts.thumbnail,
          views: shorts.views,
          likes: shorts.likes,
          shares: shorts.shares,
          uploadDate: shorts.uploadDate
        }
      })
        .from(shortShares)
        .innerJoin(shorts, eq(shortShares.shortId, shorts.id))
        .where(eq(shortShares.userId, userId))
        .orderBy(desc(shortShares.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching user short shares:', error)
      return []
    }
  }

  // Analytics methods
  async getShareStats(contentId: string, contentType: 'video' | 'short'): Promise<{
    totalShares: number
    platformBreakdown: { platform: string; count: number }[]
  }> {
    try {
      if (contentType === 'video') {
        // Get total shares for video
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(videoShares)
          .where(eq(videoShares.videoId, contentId))

        // Get platform breakdown for video
        const platformResult = await db.select({
          platform: videoShares.platform,
          count: sql<number>`count(*)`
        })
          .from(videoShares)
          .where(eq(videoShares.videoId, contentId))
          .groupBy(videoShares.platform)

        return {
          totalShares: totalResult[0]?.count || 0,
          platformBreakdown: platformResult.map(item => ({
            platform: item.platform,
            count: item.count
          }))
        }
      } else {
        // Get total shares for short
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(shortShares)
          .where(eq(shortShares.shortId, contentId))

        // Get platform breakdown for short
        const platformResult = await db.select({
          platform: shortShares.platform,
          count: sql<number>`count(*)`
        })
          .from(shortShares)
          .where(eq(shortShares.shortId, contentId))
          .groupBy(shortShares.platform)

        return {
          totalShares: totalResult[0]?.count || 0,
          platformBreakdown: platformResult.map(item => ({
            platform: item.platform,
            count: item.count
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching share stats:', error)
      return {
        totalShares: 0,
        platformBreakdown: []
      }
    }
  }
}

export const shareService = new ShareService() 