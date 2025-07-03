import { db } from '../../db'
import { streamSessions, streamKeys, users } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { StreamSession } from '../../db/schema'
import { websocketService } from './websocketService'

export class StreamSessionService {
  // Create a new stream session
  async createSession(streamKeyId: string, title?: string, description?: string): Promise<StreamSession | null> {
    try {
      // Check if there's already an active session for this stream key
      const existingSession = await db
        .select()
        .from(streamSessions)
        .where(and(
          eq(streamSessions.streamKeyId, streamKeyId),
          eq(streamSessions.status, 'live')
        ))
        .limit(1)
      
      if (existingSession.length > 0 && existingSession[0]) {
        console.log('Active session already exists for stream key:', streamKeyId)
        return existingSession[0]
      }

      const result = await db.insert(streamSessions).values({
        streamKeyId,
        title,
        description,
        status: 'idle'
      }).returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error creating stream session:', error)
      return null
    }
  }

  // Start a stream session
  async startSession(sessionId: string): Promise<StreamSession | null> {
    try {
      const result = await db.update(streamSessions)
        .set({
          status: 'live',
          startedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(streamSessions.id, sessionId))
        .returning()
      
      const session = result[0]
      if (session) {
        // Update stream key to isLive = true
        await db.update(streamKeys)
          .set({ isLive: true })
          .where(eq(streamKeys.id, session.streamKeyId))
        
        // Get stream key to broadcast status
        const streamKey = await db.select({ key: streamKeys.key })
          .from(streamKeys)
          .where(eq(streamKeys.id, session.streamKeyId))
          .limit(1)
        
        if (streamKey[0]) {
          // Broadcast status update via WebSocket
          await websocketService.broadcastStatusUpdate(streamKey[0].key)
        }
      }
      
      return session || null
    } catch (error) {
      console.error('Error starting stream session:', error)
      return null
    }
  }

  // Stop a stream session
  async stopSession(sessionId: string): Promise<StreamSession | null> {
    try {
      const result = await db.update(streamSessions)
        .set({
          status: 'ended',
          endedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(streamSessions.id, sessionId))
        .returning()
      
      const session = result[0]
      if (session) {
        // Update stream key to isLive = false
        await db.update(streamKeys)
          .set({ isLive: false })
          .where(eq(streamKeys.id, session.streamKeyId))
        
        // Get stream key to broadcast status
        const streamKey = await db.select({ key: streamKeys.key })
          .from(streamKeys)
          .where(eq(streamKeys.id, session.streamKeyId))
          .limit(1)
        
        if (streamKey[0]) {
          // Broadcast status update via WebSocket
          await websocketService.broadcastStatusUpdate(streamKey[0].key)
        }
      }
      
      return session || null
    } catch (error) {
      console.error('Error stopping stream session:', error)
      return null
    }
  }

  // Update session title and description
  async updateSession(sessionId: string, title?: string, description?: string): Promise<StreamSession | null> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      }
      
      if (title !== undefined) {
        updateData.title = title
      }
      
      if (description !== undefined) {
        updateData.description = description
      }

      const result = await db.update(streamSessions)
        .set(updateData)
        .where(eq(streamSessions.id, sessionId))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating session:', error)
      return null
    }
  }

  // Update viewer count
  async updateViewerCount(sessionId: string, viewerCount: number): Promise<StreamSession | null> {
    try {
      const result = await db.update(streamSessions)
        .set({
          viewerCount,
          maxViewerCount: sql`GREATEST(max_viewer_count, ${viewerCount})`,
          updatedAt: new Date()
        })
        .where(eq(streamSessions.id, sessionId))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error updating viewer count:', error)
      return null
    }
  }

  // Add donation to session
  async addDonation(sessionId: string, amount: number): Promise<StreamSession | null> {
    try {
      const result = await db.update(streamSessions)
        .set({
          totalDonation: sql`total_donation + ${amount}`,
          totalDonationCount: sql`total_donation_count + 1`,
          updatedAt: new Date()
        })
        .where(eq(streamSessions.id, sessionId))
        .returning()
      
      return result[0] || null
    } catch (error) {
      console.error('Error adding donation:', error)
      return null
    }
  }

  // Get active sessions (currently live)
  async getActiveSessions(): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(streamSessions)
        .innerJoin(streamKeys, eq(streamSessions.streamKeyId, streamKeys.id))
        .innerJoin(users, eq(streamKeys.userId, users.id))
        .where(eq(streamSessions.status, 'live'))
        .orderBy(desc(streamSessions.startedAt))
      
      return sessions
    } catch (error) {
      console.error('Error getting active sessions:', error)
      return []
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(streamSessions)
        .innerJoin(streamKeys, eq(streamSessions.streamKeyId, streamKeys.id))
        .innerJoin(users, eq(streamKeys.userId, users.id))
        .where(eq(streamSessions.id, sessionId))
      
      return result[0] || null
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Get session by stream key
  async getSessionByStreamKey(streamKey: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(streamSessions)
        .innerJoin(streamKeys, eq(streamSessions.streamKeyId, streamKeys.id))
        .innerJoin(users, eq(streamKeys.userId, users.id))
        .where(eq(streamKeys.key, streamKey))
        .orderBy(desc(streamSessions.createdAt))
        .limit(1)
      
      return result[0] || null
    } catch (error) {
      console.error('Error getting session by stream key:', error)
      return null
    }
  }

  // Get current live session by stream key
  async getLiveSessionByStreamKey(streamKey: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(streamSessions)
        .innerJoin(streamKeys, eq(streamSessions.streamKeyId, streamKeys.id))
        .innerJoin(users, eq(streamKeys.userId, users.id))
        .where(and(
          eq(streamKeys.key, streamKey),
          eq(streamSessions.status, 'live')
        ))
      
      return result[0] || null
    } catch (error) {
      console.error('Error getting live session by stream key:', error)
      return null
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<StreamSession[]> {
    try {
      const sessions = await db
        .select()
        .from(streamSessions)
        .innerJoin(streamKeys, eq(streamSessions.streamKeyId, streamKeys.id))
        .where(eq(streamKeys.userId, userId))
        .orderBy(desc(streamSessions.createdAt))
      
      return sessions.map(s => s.stream_sessions)
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return []
    }
  }

  // Update stream key isLive status based on RTMP events
  async updateStreamKeyLiveStatus(streamKey: string, isLive: boolean): Promise<void> {
    try {
      await db.update(streamKeys)
        .set({ 
          isLive,
          lastUsed: isLive ? new Date() : undefined
        })
        .where(eq(streamKeys.key, streamKey))
    } catch (error) {
      console.error('Error updating stream key live status:', error)
    }
  }
}

export const streamSessionService = new StreamSessionService() 