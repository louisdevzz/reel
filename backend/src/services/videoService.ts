import { db } from '../../db'
import { videos, shorts, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export interface UploadVideoRequest {
  title: string
  description?: string
  duration: number // in seconds
  thumbnail: string
  videoUrl: string
  userId: string
  tags?: string[]
  isPublic?: boolean
}

export interface VideoUploadResponse {
  id: string
  type: 'video' | 'short'
  title: string
  videoUrl: string
  thumbnail: string
  duration: number
}

export class VideoService {
  async uploadVideo(data: UploadVideoRequest): Promise<VideoUploadResponse> {
    // Determine if it's a short (≤ 60 seconds) or regular video (> 60 seconds)
    const isShort = data.duration <= 60
    const type = isShort ? 'short' : 'video'
    const videoId = uuidv4()

    try {
      if (isShort) {
        // Upload as short and update user count in parallel
        const [shortResults] = await Promise.all([
          db.insert(shorts).values({
            id: videoId,
            title: data.title,
            description: data.description,
            duration: data.duration,
            thumbnail: data.thumbnail,
            videoUrl: data.videoUrl,
            userId: data.userId,
            tags: data.tags,
            isPublic: data.isPublic ?? true,
          }).returning(),
          
          // Update user's shorts count asynchronously
          db.execute(
            `UPDATE users SET shorts = shorts + 1 WHERE id = '${data.userId}'`
          ).catch(error => {
            console.error('Failed to update user shorts count:', error)
          })
        ])

        const shortResult = shortResults[0]
        if (!shortResult) {
          throw new Error('Failed to create short')
        }

        return {
          id: shortResult.id,
          type: 'short',
          title: shortResult.title,
          videoUrl: shortResult.videoUrl,
          thumbnail: shortResult.thumbnail,
          duration: shortResult.duration,
        }
      } else {
        // Upload as regular video and update user count in parallel
        const [videoResults] = await Promise.all([
          db.insert(videos).values({
            id: videoId,
            title: data.title,
            description: data.description,
            duration: data.duration,
            type: 'video',
            thumbnail: data.thumbnail,
            videoUrl: data.videoUrl,
            userId: data.userId,
            tags: data.tags,
            isPublic: data.isPublic ?? true,
          }).returning(),
          
          // Update user's videos count asynchronously
          db.execute(
            `UPDATE users SET videos = videos + 1 WHERE id = '${data.userId}'`
          ).catch(error => {
            console.error('Failed to update user videos count:', error)
          })
        ])

        const videoResult = videoResults[0]
        if (!videoResult) {
          throw new Error('Failed to create video')
        }

        return {
          id: videoResult.id,
          type: 'video',
          title: videoResult.title,
          videoUrl: videoResult.videoUrl,
          thumbnail: videoResult.thumbnail,
          duration: videoResult.duration,
        }
      }
    } catch (error) {
      console.error('Database error during video upload:', error)
      throw new Error(`Failed to save video to database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getVideosByUser(userId: string) {
    return await db.select().from(videos).where(eq(videos.userId, userId))
  }

  async getShortsByUser(userId: string) {
    return await db.select().from(shorts).where(eq(shorts.userId, userId))
  }

  async getVideoById(id: string) {
    const [video] = await db.select().from(videos).where(eq(videos.id, id))
    return video
  }

  async getVideoByIdUniversal(id: string) {
    // Tìm trong bảng videos trước
    const [video] = await db.select().from(videos).where(eq(videos.id, id))
    if (video) {
      return video
    }
    
    // Nếu không tìm thấy, tìm trong bảng shorts
    const [short] = await db.select().from(shorts).where(eq(shorts.id, id))
    return short
  }

  async getAllVideos() {
    return await db.select().from(videos).where(eq(videos.isPublic, true)).orderBy(desc(videos.uploadDate))
  }

  async getAllShorts() {
    return await db
      .select({
        id: shorts.id,
        title: shorts.title,
        description: shorts.description,
        duration: shorts.duration,
        thumbnail: shorts.thumbnail,
        videoUrl: shorts.videoUrl,
        views: shorts.views,
        likes: shorts.likes,
        shares: shorts.shares,
        comments: shorts.comments,
        bookmarks: shorts.bookmarks,
        uploadDate: shorts.uploadDate,
        userId: shorts.userId,
        tags: shorts.tags,
        isPublic: shorts.isPublic,
        // User information
        creator: users.username,
        creatorFullName: users.fullName,
        creatorAvatar: users.avatar,
        creatorFollowers: users.followers,
      })
      .from(shorts)
      .leftJoin(users, eq(shorts.userId, users.id))
      .where(eq(shorts.isPublic, true))
      .orderBy(desc(shorts.uploadDate))
  }

  async getShortsWithPagination(limit: number = 20, offset: number = 0) {
    return await db
      .select({
        id: shorts.id,
        title: shorts.title,
        description: shorts.description,
        duration: shorts.duration,
        thumbnail: shorts.thumbnail,
        videoUrl: shorts.videoUrl,
        views: shorts.views,
        likes: shorts.likes,
        shares: shorts.shares,
        comments: shorts.comments,
        bookmarks: shorts.bookmarks,
        uploadDate: shorts.uploadDate,
        userId: shorts.userId,
        tags: shorts.tags,
        isPublic: shorts.isPublic,
        // User information
        creator: users.username,
        creatorFullName: users.fullName,
        creatorAvatar: users.avatar,
        creatorFollowers: users.followers,
      })
      .from(shorts)
      .leftJoin(users, eq(shorts.userId, users.id))
      .where(eq(shorts.isPublic, true))
      .orderBy(desc(shorts.uploadDate))
      .limit(limit)
      .offset(offset)
  }

  async getShortsAroundVideo(videoId: string, limit: number = 10) {
    // First, get the position of the current video
    const allShorts = await this.getAllShorts()
    const currentIndex = allShorts.findIndex(short => short.id === videoId)
    
    if (currentIndex === -1) {
      return allShorts.slice(0, limit)
    }
    
    // Calculate start and end indices
    const startIndex = Math.max(0, currentIndex - Math.floor(limit / 2))
    const endIndex = Math.min(allShorts.length, startIndex + limit)
    
    return allShorts.slice(startIndex, endIndex)
  }

  async getShortById(id: string) {
    const [short] = await db
      .select({
        id: shorts.id,
        title: shorts.title,
        description: shorts.description,
        duration: shorts.duration,
        thumbnail: shorts.thumbnail,
        videoUrl: shorts.videoUrl,
        views: shorts.views,
        likes: shorts.likes,
        shares: shorts.shares,
        comments: shorts.comments,
        bookmarks: shorts.bookmarks,
        uploadDate: shorts.uploadDate,
        userId: shorts.userId,
        tags: shorts.tags,
        isPublic: shorts.isPublic,
        // User information
        creator: users.username,
        creatorFullName: users.fullName,
        creatorAvatar: users.avatar,
        creatorFollowers: users.followers,
      })
      .from(shorts)
      .leftJoin(users, eq(shorts.userId, users.id))
      .where(eq(shorts.id, id))
    return short
  }

  async deleteAllVideos() {
    try {
      // Delete all videos and shorts in parallel
      const [videosDeleted, shortsDeleted] = await Promise.all([
        db.delete(videos).returning(),
        db.delete(shorts).returning()
      ])

      // Reset all user video and shorts counts to 0
      await db.execute(
        `UPDATE users SET videos = 0, shorts = 0`
      )

      return {
        videosDeleted: videosDeleted.length,
        shortsDeleted: shortsDeleted.length,
        message: 'All videos and shorts have been deleted successfully'
      }
    } catch (error) {
      console.error('Database error during delete all videos:', error)
      throw new Error(`Failed to delete all videos: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 