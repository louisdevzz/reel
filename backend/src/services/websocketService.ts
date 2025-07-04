import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import { streamSessionService } from './streamSessionService';
import { streamKeyService } from './streamKeyService';
import { chatService } from './chatService';
import { userService } from './userService';

interface StreamStatusClient {
  ws: WebSocket;
  streamKey: string;
  interval?: NodeJS.Timeout;
}

interface ChatClient {
  ws: WebSocket;
  streamKey: string;
  userId?: string;
  username?: string;
  avatar?: string;
}

class WebSocketService {
  private wss: any | null = null;
  private statusClients: Map<string, StreamStatusClient> = new Map();
  private chatClients: Map<string, ChatClient[]> = new Map();

  initialize(server: any) {
    try {
      // Create standalone WebSocket server to avoid HTTP module issues
      this.wss = new WebSocketServer({ 
        port: 3002,
        perMessageDeflate: false
      });
      
      this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
        this.handleConnection(ws, req);
      });

      this.wss.on('error', (error: Error) => {
        console.error('[WebSocketService] WebSocket server error:', error);
      });

      console.log('[WebSocketService] WebSocket server initialized successfully on port 3002');
    } catch (error) {
      console.error('[WebSocketService] Failed to initialize WebSocket server:', error);
      throw error;
    }
  }

  private handleConnection(ws: WebSocket, req: http.IncomingMessage) {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const type = url.searchParams.get('type'); // 'status' or 'chat'
      const streamKey = url.searchParams.get('key');
      const userId = url.searchParams.get('userId');
      const username = url.searchParams.get('username');
      const avatar = url.searchParams.get('avatar');

      if (!streamKey) {
        console.log('[WebSocketService] Error handling connection: No stream key provided');
        ws.close();
        return;
      }

      if (type === 'chat') {
        this.handleChatConnection(ws, streamKey, userId || undefined, username || undefined, avatar || undefined);
      } else {
        this.handleStatusConnection(ws, streamKey);
      }
    } catch (error) {
      console.error('[WebSocketService] Error handling connection:', error);
      ws.close();
    }
  }

  private handleStatusConnection(ws: WebSocket, streamKey: string) {
    console.log(`[WebSocketService] New status connection for stream key: ${streamKey}`);

    const client: StreamStatusClient = {
      ws,
      streamKey
    };

    this.statusClients.set(streamKey, client);

    // Send status immediately
    this.sendStatus(client);

    // Send status every second
    const interval = setInterval(() => {
      this.sendStatus(client);
    }, 1000);

    client.interval = interval;

    ws.addEventListener('close', () => {
      console.log(`[WebSocketService] Status connection closed for stream key: ${streamKey}`);
      if (client.interval) {
        clearInterval(client.interval);
      }
      this.statusClients.delete(streamKey);
    });

    ws.addEventListener('error', (error: Event) => {
      console.error(`[WebSocketService] Status WebSocket error for ${streamKey}:`, error);
      if (client.interval) {
        clearInterval(client.interval);
      }
      this.statusClients.delete(streamKey);
    });
  }

  private handleChatConnection(ws: WebSocket, streamKey: string, userId?: string, username?: string, avatar?: string) {
    console.log(`[WebSocketService] New chat connection for stream key: ${streamKey}, user: ${username}`);

    const client: ChatClient = {
      ws,
      streamKey,
      userId,
      username,
      avatar
    };

    // Add to chat clients
    if (!this.chatClients.has(streamKey)) {
      this.chatClients.set(streamKey, []);
    }
    this.chatClients.get(streamKey)!.push(client);

    // Join chat room
    if (userId) {
      chatService.joinChatRoom(streamKey, userId);
    }

    // Send recent messages
    this.sendRecentMessages(client);

    // Handle chat messages
    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        if (data.type === 'chat_message' && data.message) {
          await this.handleChatMessage(client, data.message);
        }
      } catch (error) {
        console.error('[WebSocketService] Error handling chat message:', error);
      }
    });

    ws.addEventListener('close', () => {
      console.log(`[WebSocketService] Chat connection closed for stream key: ${streamKey}, user: ${username}`);
      this.removeChatClient(streamKey, client);
      if (userId) {
        chatService.leaveChatRoom(streamKey, userId);
      }
    });

    ws.addEventListener('error', (error: Event) => {
      console.error(`[WebSocketService] Chat WebSocket error for ${streamKey}:`, error);
      this.removeChatClient(streamKey, client);
      if (userId) {
        chatService.leaveChatRoom(streamKey, userId);
      }
    });
  }

  private async handleChatMessage(client: ChatClient, message: string) {
    if (!client.username) {
      console.log('[WebSocketService] Anonymous user cannot send messages');
      return;
    }

    // Add message to chat service
    const chatMessage = await chatService.addMessage(
      client.streamKey,
      client.username,
      message,
      client.avatar,
      client.userId
    );

    // Broadcast to all clients in the same stream
    this.broadcastChatMessage(client.streamKey, {
      type: 'chat_message',
      message: chatMessage
    });
  }

  private async sendRecentMessages(client: ChatClient) {
    try {
      const messages = await chatService.getMessages(client.streamKey, 50);
      if (client.ws.readyState === 1) {
        client.ws.send(JSON.stringify({
          type: 'recent_messages',
          messages
        }));
      }
    } catch (error) {
      console.error('[WebSocketService] Error sending recent messages:', error);
    }
  }

  private broadcastChatMessage(streamKey: string, data: any) {
    const clients = this.chatClients.get(streamKey) || [];
    const message = JSON.stringify(data);

    clients.forEach(client => {
      if (client.ws.readyState === 1) {
        client.ws.send(message);
      }
    });
  }

  private removeChatClient(streamKey: string, client: ChatClient) {
    const clients = this.chatClients.get(streamKey);
    if (clients) {
      const index = clients.indexOf(client);
      if (index > -1) {
        clients.splice(index, 1);
      }
      if (clients.length === 0) {
        this.chatClients.delete(streamKey);
      }
    }
  }

  private async sendStatus(client: StreamStatusClient) {
    try {
      // Check both session and isLive field
      const session = await streamSessionService.getLiveSessionByStreamKey(client.streamKey);
      const streamKeyData = await streamKeyService.getStreamKeyByKey(client.streamKey);
      
      const isLive = !!session || (streamKeyData && streamKeyData.isLive);
      
      // Send status if WebSocket is still open
      if (client.ws.readyState === 1) { // WebSocket.OPEN = 1
        client.ws.send(JSON.stringify({ isLive }));
      }
    } catch (error) {
      console.error('[WebSocketService] Error checking stream status:', error);
      if (client.ws.readyState === 1) { // WebSocket.OPEN = 1
        client.ws.send(JSON.stringify({ isLive: false }));
      }
    }
  }

  // Broadcast status update to all clients for a specific stream key
  async broadcastStatusUpdate(streamKey: string) {
    const client = this.statusClients.get(streamKey);
    if (client) {
      console.log(`[WebSocketService] Broadcasting status update for ${streamKey}`);
      await this.sendStatus(client);
    }
  }

  // Broadcast to all status clients
  async broadcastToAll() {
    for (const [streamKey, client] of this.statusClients) {
      await this.sendStatus(client);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.statusClients.size + Array.from(this.chatClients.values()).flat().length;
  }

  // Get all connected stream keys
  getConnectedStreamKeys(): string[] {
    return Array.from(this.statusClients.keys());
  }

  // Get chat participants for a stream
  getChatParticipants(streamKey: string): string[] {
    return chatService.getChatRoomParticipants(streamKey);
  }
}

export const websocketService = new WebSocketService(); 