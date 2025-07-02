import { eq, and, desc, sql } from 'drizzle-orm'
import { db, videoViews, shortViews, videos, shorts, users, type VideoView, type ShortView, type NewVideoView, type NewShortView } from '../../db'

interface CreateViewRequest {
  userId?: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
  watchDuration?: number
  isCompleted?: boolean
}

class ViewService {
  // Video Views
  async addVideoView(videoId: string, data: CreateViewRequest): Promise<VideoView | null> {
    try {
      // Check if view already exists for this session
      const existingView = await db.select()
        .from(videoViews)
        .where(and(eq(videoViews.videoId, videoId), eq(videoViews.sessionId, data.sessionId)))
      
      if (existingView.length > 0) {
        const existing = existingView[0]
        if (!existing) return null
        
        // Update existing view
        const result = await db.update(videoViews)
          .set({
            watchDuration: data.watchDuration ?? existing.watchDuration,
            isCompleted: data.isCompleted ?? existing.isCompleted,
          })
          .where(eq(videoViews.id, existing.id))
          .returning()
        
        return result[0] || null
      }

      // Create new view
      const newView: NewVideoView = {
        userId: data.userId || null,
        videoId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        watchDuration: data.watchDuration || 0,
        isCompleted: data.isCompleted || false,
      }

      const result = await db.transaction(async (tx) => {
        // Add view record
        const viewResult = await tx.insert(videoViews)
          .values(newView)
          .returning()
        
        // Update video view count
        await tx.update(videos)
          .set({ views: sql`${videos.views} + 1` })
          .where(eq(videos.id, videoId))
        
        return viewResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding video view:', error)
      throw error
    }
  }

  async updateVideoView(viewId: string, data: Partial<CreateViewRequest>): Promise<VideoView | null> {
    try {
      const result = await db.update(videoViews)
        .set({
          watchDuration: data.watchDuration,
          isCompleted: data.isCompleted,
        })
        .where(eq(videoViews.id, viewId))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating video view:', error)
      return null
    }
  }

  async getVideoViews(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        view: videoViews,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(videoViews)
        .leftJoin(users, eq(videoViews.userId, users.id))
        .where(eq(videoViews.videoId, videoId))
        .orderBy(desc(videoViews.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching video views:', error)
      return []
    }
  }

  // Short Views
  async addShortView(shortId: string, data: CreateViewRequest): Promise<ShortView | null> {
    try {
      // Check if view already exists for this session
      const existingView = await db.select()
        .from(shortViews)
        .where(and(eq(shortViews.shortId, shortId), eq(shortViews.sessionId, data.sessionId)))
      
      if (existingView.length > 0) {
        const existing = existingView[0]
        if (!existing) return null
        
        // Update existing view
        const result = await db.update(shortViews)
          .set({
            watchDuration: data.watchDuration ?? existing.watchDuration,
            isCompleted: data.isCompleted ?? existing.isCompleted,
          })
          .where(eq(shortViews.id, existing.id))
          .returning()
        
        return result[0] || null
      }

      // Create new view
      const newView: NewShortView = {
        userId: data.userId || null,
        shortId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        watchDuration: data.watchDuration || 0,
        isCompleted: data.isCompleted || false,
      }

      const result = await db.transaction(async (tx) => {
        // Add view record
        const viewResult = await tx.insert(shortViews)
          .values(newView)
          .returning()
        
        // Update short view count
        await tx.update(shorts)
          .set({ views: sql`${shorts.views} + 1` })
          .where(eq(shorts.id, shortId))
        
        return viewResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding short view:', error)
      throw error
    }
  }

  async updateShortView(viewId: string, data: Partial<CreateViewRequest>): Promise<ShortView | null> {
    try {
      const result = await db.update(shortViews)
        .set({
          watchDuration: data.watchDuration,
          isCompleted: data.isCompleted,
        })
        .where(eq(shortViews.id, viewId))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating short view:', error)
      return null
    }
  }

  async getShortViews(shortId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const result = await db.select({
        view: shortViews,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(shortViews)
        .leftJoin(users, eq(shortViews.userId, users.id))
        .where(eq(shortViews.shortId, shortId))
        .orderBy(desc(shortViews.createdAt))
        .limit(limit)
        .offset(offset)
      
      return result
    } catch (error) {
      console.error('Error fetching short views:', error)
      return []
    }
  }

  // Analytics methods
  async getViewStats(contentId: string, contentType: 'video' | 'short'): Promise<{
    totalViews: number
    uniqueViews: number
    completedViews: number
    averageWatchDuration: number
  }> {
    try {
      if (contentType === 'video') {
        // Get total views
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(videoViews)
          .where(eq(videoViews.videoId, contentId))

        // Get unique views (by session)
        const uniqueResult = await db.select({ count: sql<number>`count(distinct session_id)` })
          .from(videoViews)
          .where(eq(videoViews.videoId, contentId))

        // Get completed views
        const completedResult = await db.select({ count: sql<number>`count(*)` })
          .from(videoViews)
          .where(and(eq(videoViews.videoId, contentId), eq(videoViews.isCompleted, true)))

        // Get average watch duration
        const avgDurationResult = await db.select({ avg: sql<number>`avg(watch_duration)` })
          .from(videoViews)
          .where(eq(videoViews.videoId, contentId))

        return {
          totalViews: totalResult[0]?.count || 0,
          uniqueViews: uniqueResult[0]?.count || 0,
          completedViews: completedResult[0]?.count || 0,
          averageWatchDuration: Math.round(avgDurationResult[0]?.avg || 0)
        }
      } else {
        // Get total views
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(shortViews)
          .where(eq(shortViews.shortId, contentId))

        // Get unique views (by session)
        const uniqueResult = await db.select({ count: sql<number>`count(distinct session_id)` })
          .from(shortViews)
          .where(eq(shortViews.shortId, contentId))

        // Get completed views
        const completedResult = await db.select({ count: sql<number>`count(*)` })
          .from(shortViews)
          .where(and(eq(shortViews.shortId, contentId), eq(shortViews.isCompleted, true)))

        // Get average watch duration
        const avgDurationResult = await db.select({ avg: sql<number>`avg(watch_duration)` })
          .from(shortViews)
          .where(eq(shortViews.shortId, contentId))

        return {
          totalViews: totalResult[0]?.count || 0,
          uniqueViews: uniqueResult[0]?.count || 0,
          completedViews: completedResult[0]?.count || 0,
          averageWatchDuration: Math.round(avgDurationResult[0]?.avg || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching view stats:', error)
      return {
        totalViews: 0,
        uniqueViews: 0,
        completedViews: 0,
        averageWatchDuration: 0
      }
    }
  }

  async getUserViewHistory(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Get video views
      const videoViewHistory = await db.select({
        view: videoViews,
        video: {
          id: videos.id,
          title: videos.title,
          thumbnail: videos.thumbnail,
          duration: videos.duration,
          views: videos.views,
          likes: videos.likes,
          uploadDate: videos.uploadDate
        }
      })
        .from(videoViews)
        .innerJoin(videos, eq(videoViews.videoId, videos.id))
        .where(eq(videoViews.userId, userId))
        .orderBy(desc(videoViews.createdAt))
        .limit(limit)
        .offset(offset)

      // Get short views
      const shortViewHistory = await db.select({
        view: shortViews,
        short: {
          id: shorts.id,
          title: shorts.title,
          thumbnail: shorts.thumbnail,
          duration: shorts.duration,
          views: shorts.views,
          likes: shorts.likes,
          uploadDate: shorts.uploadDate
        }
      })
        .from(shortViews)
        .innerJoin(shorts, eq(shortViews.shortId, shorts.id))
        .where(eq(shortViews.userId, userId))
        .orderBy(desc(shortViews.createdAt))
        .limit(limit)
        .offset(offset)

      // Combine and sort by view date
      const allViews = [...videoViewHistory, ...shortViewHistory]
        .sort((a, b) => new Date(b.view.createdAt).getTime() - new Date(a.view.createdAt).getTime())
        .slice(0, limit)

      return allViews
    } catch (error) {
      console.error('Error fetching user view history:', error)
      return []
    }
  }
}

export const viewService = new ViewService() 