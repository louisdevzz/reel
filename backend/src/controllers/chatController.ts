import type { Request, Response } from 'express';
import { chatService } from '../services/chatService';

export class ChatController {
  // Get recent messages for a stream
  async getMessages(req: Request, res: Response) {
    try {
      const { streamKey } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!streamKey) {
        return res.status(400).json({ error: 'Stream key is required' });
      }

      const messages = await chatService.getMessages(streamKey, limit);
      res.json({ messages });
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get message count for a stream
  async getMessageCount(req: Request, res: Response) {
    try {
      const { streamKey } = req.params;

      if (!streamKey) {
        return res.status(400).json({ error: 'Stream key is required' });
      }

      const count = await chatService.getMessageCount(streamKey);
      res.json({ count });
    } catch (error) {
      console.error('Error getting message count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get chat participants for a stream
  async getParticipants(req: Request, res: Response) {
    try {
      const { streamKey } = req.params;

      if (!streamKey) {
        return res.status(400).json({ error: 'Stream key is required' });
      }

      const participants = chatService.getChatRoomParticipants(streamKey);
      res.json({ participants });
    } catch (error) {
      console.error('Error getting chat participants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Clear messages for a stream (admin only)
  async clearMessages(req: Request, res: Response) {
    try {
      const { streamKey } = req.params;

      if (!streamKey) {
        return res.status(400).json({ error: 'Stream key is required' });
      }

      const success = await chatService.clearStreamMessages(streamKey);
      if (success) {
        res.json({ message: 'Messages cleared successfully' });
      } else {
        res.status(500).json({ error: 'Failed to clear messages' });
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get active chat rooms
  async getActiveChatRooms(req: Request, res: Response) {
    try {
      const activeRooms = chatService.getActiveChatRooms();
      res.json({ activeRooms });
    } catch (error) {
      console.error('Error getting active chat rooms:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const chatController = new ChatController(); 