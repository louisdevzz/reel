import { v4 as uuidv4 } from 'uuid';
import type { StreamKey, CreateStreamKeyRequest, UpdateStreamKeyRequest } from '../types';
import { db } from '../../db';
import { streamKeys, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to convert database result to StreamKey type
function convertDbResultToStreamKey(dbResult: any): StreamKey | undefined {
  if (!dbResult) return undefined;
  return {
    ...dbResult,
    lastUsed: dbResult.lastUsed || undefined
  };
}

class StreamKeyService {
  generateStreamKey(): string {
    // Generate a random stream key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createStreamKey(data: CreateStreamKeyRequest, userId: string): Promise<StreamKey> {
    // Check if user already has a stream key
    const existingKey = await db.select().from(streamKeys).where(eq(streamKeys.userId, userId));
    if (existingKey.length > 0) {
      throw new Error('User already has a stream key');
    }

    const key = this.generateStreamKey();
    
    const [streamKey] = await db.insert(streamKeys).values({
      userId,
      key,
      name: data.name,
      isActive: true,
      createdAt: new Date(),
    }).returning();

    return convertDbResultToStreamKey(streamKey)!;
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
    const newKey = this.generateStreamKey();
    const [updatedStreamKey] = await db
      .update(streamKeys)
      .set({ 
        key: newKey,
        lastUsed: new Date()
      })
      .where(eq(streamKeys.id, id))
      .returning();
    
    return convertDbResultToStreamKey(updatedStreamKey) || null;
  }

}

export const streamKeyService = new StreamKeyService(); 