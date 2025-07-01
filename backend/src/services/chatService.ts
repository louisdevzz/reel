import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '../types';

class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();
  private maxMessagesPerStream = 100;

  addMessage(streamId: string, username: string, message: string): ChatMessage {
    const id = uuidv4();
    const chatMessage: ChatMessage = {
      id,
      streamId,
      username,
      message,
      timestamp: new Date(),
    };

    if (!this.messages.has(streamId)) {
      this.messages.set(streamId, []);
    }

    const streamMessages = this.messages.get(streamId)!;
    streamMessages.push(chatMessage);

    // Keep only the latest messages
    if (streamMessages.length > this.maxMessagesPerStream) {
      streamMessages.splice(0, streamMessages.length - this.maxMessagesPerStream);
    }

    return chatMessage;
  }

  getMessages(streamId: string, limit: number = 50): ChatMessage[] {
    const streamMessages = this.messages.get(streamId) || [];
    return streamMessages.slice(-limit);
  }

  getRecentMessages(streamId: string, since: Date): ChatMessage[] {
    const streamMessages = this.messages.get(streamId) || [];
    return streamMessages.filter(msg => msg.timestamp > since);
  }

  deleteMessage(streamId: string, messageId: string): boolean {
    const streamMessages = this.messages.get(streamId);
    if (!streamMessages) {
      return false;
    }

    const index = streamMessages.findIndex(msg => msg.id === messageId);
    if (index === -1) {
      return false;
    }

    streamMessages.splice(index, 1);
    return true;
  }

  clearStreamMessages(streamId: string): boolean {
    return this.messages.delete(streamId);
  }

  getMessageCount(streamId: string): number {
    const streamMessages = this.messages.get(streamId);
    return streamMessages ? streamMessages.length : 0;
  }

  // Get messages for multiple streams
  getMessagesForStreams(streamIds: string[], limit: number = 20): Record<string, ChatMessage[]> {
    const result: Record<string, ChatMessage[]> = {};
    
    streamIds.forEach(streamId => {
      result[streamId] = this.getMessages(streamId, limit);
    });

    return result;
  }
}

export const chatService = new ChatService(); 