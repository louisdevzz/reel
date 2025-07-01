import type { Request, Response } from 'express';
import { chatService } from '../services/chatService';

export class ChatController {
  // Get messages for a stream
  async getMessages(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      const messages = chatService.getMessages(streamId, limit);
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Add a new message
  async addMessage(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      const { username, message } = req.body;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      if (!username || !message) {
        return res.status(400).json({
          success: false,
          message: 'Username and message are required',
        });
      }

      if (message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty',
        });
      }

      const chatMessage = chatService.addMessage(streamId, username, message);
      res.status(201).json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get recent messages since a specific time
  async getRecentMessages(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      const { since } = req.query;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      if (!since) {
        return res.status(400).json({
          success: false,
          message: 'Since timestamp is required',
        });
      }

      const sinceDate = new Date(since as string);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timestamp format',
        });
      }

      const messages = chatService.getRecentMessages(streamId, sinceDate);
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent messages',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response) {
    try {
      const { streamId, messageId } = req.params;
      
      if (!streamId || !messageId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID and message ID are required',
        });
      }

      const success = chatService.deleteMessage(streamId, messageId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Clear all messages for a stream
  async clearMessages(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      const success = chatService.clearStreamMessages(streamId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Stream not found',
        });
      }

      res.json({
        success: true,
        message: 'Messages cleared successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear messages',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get message count for a stream
  async getMessageCount(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      const count = chatService.getMessageCount(streamId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get message count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get messages for multiple streams
  async getMessagesForStreams(req: Request, res: Response) {
    try {
      const { streamIds } = req.body;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!Array.isArray(streamIds) || streamIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stream IDs array is required',
        });
      }

      const messages = chatService.getMessagesForStreams(streamIds, limit);
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages for streams',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 