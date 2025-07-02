import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm'
import { db, videoComments, shortComments, videos, shorts, users, type VideoComment, type ShortComment, type NewVideoComment, type NewShortComment } from '../../db'

interface CreateCommentRequest {
  userId: string
  content: string
  parentId?: string
}

class CommentService {
  // Video Comments
  async addVideoComment(videoId: string, data: CreateCommentRequest): Promise<VideoComment | null> {
    try {
      const newComment: NewVideoComment = {
        userId: data.userId,
        videoId,
        content: data.content,
        parentId: data.parentId || null,
      }

      const result = await db.transaction(async (tx) => {
        // Add comment
        const commentResult = await tx.insert(videoComments)
          .values(newComment)
          .returning()
        
        // Update video comment count
        await tx.update(videos)
          .set({ comments: sql`${videos.comments} + 1` })
          .where(eq(videos.id, videoId))
        
        return commentResult[0]
      })
      
      return result || null
    } catch (error) {
      console.error('Error adding video comment:', error)
      // Re-throw the error to be handled by the controller
      throw error
    }
  }

  async removeVideoComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.transaction(async (tx) => {
        // Get comment to find videoId
        const comment = await tx.select()
          .from(videoComments)
          .where(eq(videoComments.id, commentId))
        
        if (!comment[0] || comment[0].userId !== userId) {
          return false
        }

        // Remove comment
        const deleteResult = await tx.delete(videoComments)
          .where(eq(videoComments.id, commentId))
          .returning()
        
        if (deleteResult.length > 0) {
          // Update video comment count
          await tx.update(videos)
            .set({ comments: sql`${videos.comments} - 1` })
            .where(eq(videos.id, comment[0].videoId))
        }
        
        return deleteResult.length > 0
      })
      
      return result
    } catch (error) {
      console.error('Error removing video comment:', error)
      return false
    }
  }

  async getVideoComments(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Get top-level comments with user info
      const topLevelComments = await db.select({
        comment: videoComments,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(videoComments)
        .innerJoin(users, eq(videoComments.userId, users.id))
        .where(and(eq(videoComments.videoId, videoId), isNull(videoComments.parentId)))
        .orderBy(desc(videoComments.createdAt))
        .limit(limit)
        .offset(offset)

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (item) => {
          const replies = await db.select({
            comment: videoComments,
            user: {
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatar: users.avatar
            }
          })
            .from(videoComments)
            .innerJoin(users, eq(videoComments.userId, users.id))
            .where(eq(videoComments.parentId, item.comment.id))
            .orderBy(asc(videoComments.createdAt))

          return {
            ...item,
            replies
          }
        })
      )

      return commentsWithReplies
    } catch (error) {
      console.error('Error fetching video comments:', error)
      return []
    }
  }

  async updateVideoComment(commentId: string, userId: string, content: string): Promise<VideoComment | null> {
    try {
      const result = await db.update(videoComments)
        .set({ 
          content,
          updatedAt: new Date()
        })
        .where(and(eq(videoComments.id, commentId), eq(videoComments.userId, userId)))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating video comment:', error)
      return null
    }
  }

  // Short Comments
  async addShortComment(shortId: string, data: CreateCommentRequest): Promise<any> {
    try {
      const newComment: NewShortComment = {
        userId: data.userId,
        shortId,
        content: data.content,
        parentId: data.parentId || null,
      }

      const result = await db.transaction(async (tx) => {
        // Add comment
        const commentResult = await tx.insert(shortComments)
          .values(newComment)
          .returning()
        
        // Update short comment count
        await tx.update(shorts)
          .set({ comments: sql`${shorts.comments} + 1` })
          .where(eq(shorts.id, shortId))
        
        return commentResult[0]
      })
      
      if (!result) return null

      // Get the comment with user information
      const commentWithUser = await db.select({
        comment: shortComments,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(shortComments)
        .innerJoin(users, eq(shortComments.userId, users.id))
        .where(eq(shortComments.id, result.id))
        .limit(1)

      return commentWithUser[0] || null
    } catch (error) {
      console.error('Error adding short comment:', error)
      // Re-throw the error to be handled by the controller
      throw error
    }
  }

  async removeShortComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.transaction(async (tx) => {
        // Get comment to find shortId
        const comment = await tx.select()
          .from(shortComments)
          .where(eq(shortComments.id, commentId))
        
        if (!comment[0] || comment[0].userId !== userId) {
          return false
        }

        // Remove comment
        const deleteResult = await tx.delete(shortComments)
          .where(eq(shortComments.id, commentId))
          .returning()
        
        if (deleteResult.length > 0) {
          // Update short comment count
          await tx.update(shorts)
            .set({ comments: sql`${shorts.comments} - 1` })
            .where(eq(shorts.id, comment[0].shortId))
        }
        
        return deleteResult.length > 0
      })
      
      return result
    } catch (error) {
      console.error('Error removing short comment:', error)
      return false
    }
  }

  async getShortComments(shortId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Get top-level comments with user info
      const topLevelComments = await db.select({
        comment: shortComments,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
        .from(shortComments)
        .innerJoin(users, eq(shortComments.userId, users.id))
        .where(and(eq(shortComments.shortId, shortId), isNull(shortComments.parentId)))
        .orderBy(desc(shortComments.createdAt))
        .limit(limit)
        .offset(offset)

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (item) => {
          const replies = await db.select({
            comment: shortComments,
            user: {
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatar: users.avatar
            }
          })
            .from(shortComments)
            .innerJoin(users, eq(shortComments.userId, users.id))
            .where(eq(shortComments.parentId, item.comment.id))
            .orderBy(asc(shortComments.createdAt))

          return {
            ...item,
            replies
          }
        })
      )

      return commentsWithReplies
    } catch (error) {
      console.error('Error fetching short comments:', error)
      return []
    }
  }

  async updateShortComment(commentId: string, userId: string, content: string): Promise<ShortComment | null> {
    try {
      const result = await db.update(shortComments)
        .set({ 
          content,
          updatedAt: new Date()
        })
        .where(and(eq(shortComments.id, commentId), eq(shortComments.userId, userId)))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating short comment:', error)
      return null
    }
  }
}

export const commentService = new CommentService() 