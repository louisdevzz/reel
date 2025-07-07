import { v4 as uuidv4 } from 'uuid';
import { Livepeer } from 'livepeer';
import type { StreamKey, CreateStreamKeyRequest, UpdateStreamKeyRequest } from '../types';
import { db } from '../../db';
import { streamKeys, streamSessions, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Livepeer client
const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_API_KEY || '',
});

// Helper function to convert database result to StreamKey type
function convertDbResultToStreamKey(dbResult: any): StreamKey | undefined {
  if (!dbResult) return undefined;
  return {
    ...dbResult,
    lastUsed: dbResult.lastUsed || undefined
  };
}

class StreamKeyService {
  async generateStreamKey(): Promise<{ streamKey: string; streamId: string; playbackId: string; playbackUrl: string }> {
    try {
      // Create stream on Livepeer Studio
      const response = await livepeer.stream.create({
        name: `stream_${Date.now()}`,
      });

      if (!response.stream) {
        throw new Error('Failed to create stream on Livepeer');
      }

      const { stream } = response;
      
      // Handle optional fields from Livepeer API with type assertion
      const streamKey = (stream as any).streamKey || '';
      const actualStreamId = stream.id as string; // This is the actual stream ID for API calls
      
      // Get additional stream details including playback ID
      const result = await livepeer.stream.get(actualStreamId);
      console.log('result', result)
      const playbackId = result.stream?.playbackId; // This is the playback ID for HLS URLs
      
      if (!playbackId) {
        throw new Error('Playback ID is missing from Livepeer response');
      }
      
      // Use correct Livepeer Studio playback URL format
      const playbackUrl = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
      
      return {
        streamKey,
        streamId: actualStreamId, // Store the actual stream ID for API calls
        playbackId, // Store playback ID separately
        playbackUrl
      };
    } catch (error) {
      console.error('Error creating stream on Livepeer:', error);
      throw new Error('Failed to create stream on Livepeer Studio');
    }
  }

  async createStreamKey(data: CreateStreamKeyRequest, userId: string): Promise<StreamKey> {
    // Check if user already has a stream key
    const existingKey = await db.select().from(streamKeys).where(eq(streamKeys.userId, userId));
    if (existingKey.length > 0) {
      throw new Error('User already has a stream key');
    }

    // Generate stream key from Livepeer Studio
    const { streamKey, streamId, playbackId, playbackUrl } = await this.generateStreamKey();
    
    const [newStreamKey] = await db.insert(streamKeys).values({
      userId,
      key: streamKey,
      name: data.name,
      isActive: true,
      createdAt: new Date(),
      // Add Livepeer-specific fields
      livepeerStreamId: streamId, // Store the actual stream ID for API calls
      playbackId: playbackId, // Store the playback ID separately
      playbackUrl: playbackUrl,
    }).returning();

    return convertDbResultToStreamKey(newStreamKey)!;
  }

  async getAllStreamKeys(): Promise<StreamKey[]> {
    const results = await db.select().from(streamKeys);
    return results.map(convertDbResultToStreamKey).filter(Boolean) as StreamKey[];
  }

  async getStreamKeyById(id: string): Promise<StreamKey | undefined> {
    const result = await db.select().from(streamKeys).where(eq(streamKeys.id, id));
    return convertDbResultToStreamKey(result[0]);
  }

  async getStreamKeyByUserId(userId: string): Promise<StreamKey | undefined> {
    const result = await db.select().from(streamKeys).where(eq(streamKeys.userId, userId));
    return convertDbResultToStreamKey(result[0]);
  }

  async getStreamKeyByUsername(username: string): Promise<StreamKey | undefined> {
    const result = await db
      .select({
        id: streamKeys.id,
        userId: streamKeys.userId,
        key: streamKeys.key,
        name: streamKeys.name,
        isActive: streamKeys.isActive,
        createdAt: streamKeys.createdAt,
        lastUsed: streamKeys.lastUsed,
        livepeerStreamId: streamKeys.livepeerStreamId,
        playbackId: streamKeys.playbackId,
        playbackUrl: streamKeys.playbackUrl,
      })
      .from(streamKeys)
      .innerJoin(users, eq(streamKeys.userId, users.id))
      .where(eq(users.username, username));
    
    return convertDbResultToStreamKey(result[0]);
  }

  async getStreamKeyByKey(key: string): Promise<StreamKey | undefined> {
    if (!key) {
      console.log(`❌ Stream key is null/undefined/empty`);
      return undefined;
    }
    
    const trimmedKey = key.trim();

    const result = await db.select().from(streamKeys).where(eq(streamKeys.key, trimmedKey));
    const found = convertDbResultToStreamKey(result[0]);
    return found;
  }

  async updateStreamKey(id: string, data: UpdateStreamKeyRequest): Promise<StreamKey | null> {
    const [updatedStreamKey] = await db
      .update(streamKeys)
      .set(data)
      .where(eq(streamKeys.id, id))
      .returning();
    
    return convertDbResultToStreamKey(updatedStreamKey) || null;
  }

  async deleteStreamKey(id: string): Promise<boolean> {
    // Get stream key data to delete from Livepeer
    const streamKeyData = await this.getStreamKeyById(id);
    if (streamKeyData?.livepeerStreamId) {
      try {
        // Delete stream from Livepeer Studio
        await livepeer.stream.delete(streamKeyData.livepeerStreamId);
      } catch (error) {
        console.error('Error deleting stream from Livepeer:', error);
      }
    }

    // First, delete associated stream sessions to avoid foreign key constraint violation
    try {
      await db.delete(streamSessions).where(eq(streamSessions.streamKeyId, id));
      console.log(`🗑️ Deleted associated stream sessions for stream key: ${id}`);
    } catch (error) {
      console.error('Error deleting associated stream sessions:', error);
      // Continue with stream key deletion even if session deletion fails
    }

    const result = await db.delete(streamKeys).where(eq(streamKeys.id, id));
    return result.length > 0;
  }

  async activateStreamKey(id: string): Promise<StreamKey | null> {
    return this.updateStreamKey(id, { isActive: true });
  }

  async deactivateStreamKey(id: string): Promise<StreamKey | null> {
    return this.updateStreamKey(id, { isActive: false });
  }

  async regenerateStreamKey(id: string): Promise<StreamKey | null> {
    // Get current stream key data
    const currentStreamKey = await this.getStreamKeyById(id);
    if (!currentStreamKey) {
      throw new Error('Stream key not found');
    }

    // Delete old stream from Livepeer if exists
    if (currentStreamKey.livepeerStreamId) {
      try {
        await livepeer.stream.delete(currentStreamKey.livepeerStreamId);
      } catch (error) {
        console.error('Error deleting old stream from Livepeer:', error);
      }
    }

    // Generate new stream key from Livepeer Studio
    const { streamKey, streamId, playbackId, playbackUrl } = await this.generateStreamKey();
    
    const [updatedStreamKey] = await db
      .update(streamKeys)
      .set({ 
        key: streamKey,
        livepeerStreamId: streamId, // Store the actual stream ID for API calls
        playbackId: playbackId, // Store the playback ID separately
        playbackUrl: playbackUrl,
        lastUsed: new Date()
      })
      .where(eq(streamKeys.id, id))
      .returning();
    
    return convertDbResultToStreamKey(updatedStreamKey) || null;
  }

  // Get stream status from Livepeer
  async getStreamStatus(streamId: string): Promise<any> {
    try {
      const response = await livepeer.stream.get(streamId);
      
      if (!response.stream) {
        console.error('No stream data in Livepeer response');
        return null;
      }

      const stream = response.stream;
      
      // According to Livepeer API docs, determine if stream is live
      // A stream is considered "live" if it's active and has recent activity
      const isActive = stream.isActive || false;
      
      // Check if stream is actually live by looking at multiple indicators:
      // 1. lastSeen timestamp (should be recent)
      // 2. ingestRate (should be > 0 if receiving data)
      // 3. outgoingRate (should be > 0 if broadcasting)
      const now = Date.now();
      const lastSeen = stream.lastSeen || 0;
      const ingestRate = stream.ingestRate || 0;
      const outgoingRate = stream.outgoingRate || 0;
      
      // Stream is live if:
      // - It's active AND
      // - Has recent activity (within 30 seconds) AND
      // - Has incoming data (ingestRate > 0)
      const isLive = isActive && 
                    (now - lastSeen) < 30000 && // 30 seconds threshold
                    ingestRate > 0; // Must be receiving data
      
      console.log(`🔍 Livepeer stream status for ${streamId}:`, {
        isActive,
        isLive,
        lastSeen: new Date(lastSeen).toISOString(),
        timeSinceLastSeen: now - lastSeen,
        ingestRate,
        outgoingRate,
        sourceSegments: stream.sourceSegments,
        transcodedSegments: stream.transcodedSegments
      });

      return {
        ...stream,
        isActive,
        isLive
      };
    } catch (error) {
      console.error('Error getting stream status from Livepeer:', error);
      return null;
    }
  }

  // Get RTMP URL for streaming
  getRtmpUrl(): string {
    return 'rtmp://rtmp.livepeer.com/live';
  }

  // Get WebRTC WHIP URL for in-browser streaming
  getWebRtcUrl(streamKey: string): string {
    return `https://playback.livepeer.studio/webrtc/${streamKey}`;
  }
}

export const streamKeyService = new StreamKeyService(); 