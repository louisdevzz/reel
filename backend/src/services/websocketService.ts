import { WebSocketServer, WebSocket } from 'ws';
import { streamSessionService } from './streamSessionService';
import { streamKeyService } from './streamKeyService';

interface StreamStatusClient {
  ws: WebSocket;
  streamKey: string;
  interval?: NodeJS.Timeout;
}

class WebSocketService {
  private wss: any | null = null;
  private clients: Map<string, StreamStatusClient> = new Map();

  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws/stream-status' });
    
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      this.handleConnection(ws, req);
    });

    console.log('[WebSocketService] WebSocket server initialized');
  }

  private handleConnection(ws: WebSocket, req: any) {
    // Lấy streamKey từ query string
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const streamKey = url.searchParams.get('key');

    if (!streamKey) {
      console.log('[WebSocketService] No stream key provided, closing connection');
      ws.close();
      return;
    }

    console.log(`[WebSocketService] New connection for stream key: ${streamKey}`);

    // Tạo client object
    const client: StreamStatusClient = {
      ws,
      streamKey
    };

    // Lưu client
    this.clients.set(streamKey, client);

    // Gửi trạng thái ngay khi kết nối
    this.sendStatus(client);

    // Gửi trạng thái mỗi 1 giây
    const interval = setInterval(() => {
      this.sendStatus(client);
    }, 1000);

    client.interval = interval;

    // Xử lý khi client disconnect
    ws.addEventListener('close', () => {
      console.log(`[WebSocketService] Connection closed for stream key: ${streamKey}`);
      if (client.interval) {
        clearInterval(client.interval);
      }
      this.clients.delete(streamKey);
    });

    ws.addEventListener('error', (error: Event) => {
      console.error(`[WebSocketService] WebSocket error for ${streamKey}:`, error);
      if (client.interval) {
        clearInterval(client.interval);
      }
      this.clients.delete(streamKey);
    });
  }

  private async sendStatus(client: StreamStatusClient) {
    try {
      // Check both session and isLive field
      const session = await streamSessionService.getLiveSessionByStreamKey(client.streamKey);
      const streamKeyData = await streamKeyService.getStreamKeyByKey(client.streamKey);
      
      const isLive = !!session || (streamKeyData && streamKeyData.isLive);
      
      // Gửi status nếu WebSocket vẫn mở
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
    const client = this.clients.get(streamKey);
    if (client) {
      console.log(`[WebSocketService] Broadcasting status update for ${streamKey}`);
      await this.sendStatus(client);
    }
  }

  // Broadcast to all clients
  async broadcastToAll() {
    for (const [streamKey, client] of this.clients) {
      await this.sendStatus(client);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Get all connected stream keys
  getConnectedStreamKeys(): string[] {
    return Array.from(this.clients.keys());
  }
}

export const websocketService = new WebSocketService(); 