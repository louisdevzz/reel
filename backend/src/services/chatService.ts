import { redisService } from './redisService';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  streamKey: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: number;
  userId?: string;
}

export interface ChatRoom {
  streamKey: string;
  participants: Set<string>;
  lastActivity: number;
}

class ChatService {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private maxMessagesPerStream = 100;
  private messageTTL = 3600; // 1 hour

  // Add a message to a stream's chat
  async addMessage(streamKey: string, username: string, message: string, avatar?: string, userId?: string): Promise<ChatMessage> {
    const id = uuidv4();
    const chatMessage: ChatMessage = {
      id,
      streamKey,
      username,
      avatar,
      message,
      timestamp: Date.now(),
      userId
    };

    // Store message in Redis
    await this.storeMessageInRedis(streamKey, chatMessage);

    return chatMessage;
  }

  // Store message in Redis
  private async storeMessageInRedis(streamKey: string, message: ChatMessage) {
    try {
      const messageData = JSON.stringify(message);
      
      // Add message to the list
      await redisService.addChatMessage(streamKey, messageData);
      
      // Trim to keep only latest messages
      await redisService.trimChatMessages(streamKey, 0, this.maxMessagesPerStream - 1);
      
      // Set TTL for the chat room
      await redisService.setChatTTL(streamKey, this.messageTTL);
      
      // Update last activity
      await this.updateChatRoomActivity(streamKey);
    } catch (error) {
      console.error('Error storing message in Redis:', error);
    }
  }

  // Get recent messages for a stream
  async getMessages(streamKey: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await redisService.getChatMessages(streamKey, 0, limit - 1);
      
      return messages
        .map(msg => JSON.parse(msg))
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting messages from Redis:', error);
      return [];
    }
  }

  // Join a chat room
  async joinChatRoom(streamKey: string, userId: string) {
    if (!this.chatRooms.has(streamKey)) {
      this.chatRooms.set(streamKey, {
        streamKey,
        participants: new Set(),
        lastActivity: Date.now()
      });
    }
    
    const room = this.chatRooms.get(streamKey)!;
    room.participants.add(userId);
    room.lastActivity = Date.now();
  }

  // Leave a chat room
  async leaveChatRoom(streamKey: string, userId: string) {
    const room = this.chatRooms.get(streamKey);
    if (room) {
      room.participants.delete(userId);
      room.lastActivity = Date.now();
      
      // Remove room if no participants
      if (room.participants.size === 0) {
        this.chatRooms.delete(streamKey);
      }
    }
  }

  // Get participants in a chat room
  getChatRoomParticipants(streamKey: string): string[] {
    const room = this.chatRooms.get(streamKey);
    return room ? Array.from(room.participants) : [];
  }

  // Update chat room activity
  private async updateChatRoomActivity(streamKey: string) {
    const room = this.chatRooms.get(streamKey);
    if (room) {
      room.lastActivity = Date.now();
    }
  }

  // Clear messages for a stream
  async clearStreamMessages(streamKey: string): Promise<boolean> {
    try {
      await redisService.deleteChatMessages(streamKey);
      
      // Remove chat room
      this.chatRooms.delete(streamKey);
      
      return true;
    } catch (error) {
      console.error('Error clearing stream messages:', error);
      return false;
    }
  }

  // Get message count for a stream
  async getMessageCount(streamKey: string): Promise<number> {
    try {
      return await redisService.getChatMessageCount(streamKey);
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  // Clean up old chat rooms
  async cleanupOldChatRooms(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours
    const now = Date.now();
    for (const [streamKey, room] of this.chatRooms.entries()) {
      if (now - room.lastActivity > maxAge) {
        await this.clearStreamMessages(streamKey);
      }
    }
  }

  // Get active chat rooms
  getActiveChatRooms(): string[] {
    return Array.from(this.chatRooms.keys());
  }
}

export const chatService = new ChatService(); 