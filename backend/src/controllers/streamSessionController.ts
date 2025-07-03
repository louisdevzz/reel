import type { Request, Response } from 'express';
import { streamSessionService } from '../services/streamSessionService';
import { streamKeyService } from '../services/streamKeyService';

export class StreamSessionController {
  // Get all sessions
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await streamSessionService.getActiveSessions();
      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get active sessions
  async getActiveSessions(req: Request, res: Response) {
    try {
      const sessions = await streamSessionService.getActiveSessions();
      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get session by ID
  async getSessionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.getSession(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new session
  async createSession(req: Request, res: Response) {
    try {
      const { streamKeyId, title, description } = req.body;
      
      if (!streamKeyId) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }

      const streamKey = await streamKeyService.getStreamKeyById(streamKeyId);
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      if (!streamKey.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Stream key is not active',
        });
      }

      const session = await streamSessionService.createSession(
        streamKeyId,
        title,
        description
      );

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Start stream
  async startStream(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.startSession(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to start stream',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Stop stream
  async stopStream(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.stopSession(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to stop stream',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update session
  async updateSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.updateSession(id, title, description);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update viewer count
  async updateViewerCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { viewerCount } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      if (typeof viewerCount !== 'number' || viewerCount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid viewer count is required',
        });
      }

      const updated = await streamSessionService.updateViewerCount(id, viewerCount);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update viewer count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get stream stats
  async getStreamStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.getSession(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stream stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update stream stats
  async updateStreamStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
      }

      const session = await streamSessionService.getSession(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update stream stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get stream status by stream key
  async getStreamStatusByKey(req: Request, res: Response) {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing or invalid stream key' });
    }
    try {
      const session = await streamSessionService.getLiveSessionByStreamKey(key);
      const isLive = !!session;
      res.json({ isLive });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get stream status', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Get live session by stream key
  async getLiveSessionByStreamKey(req: Request, res: Response) {
    try {
      const { streamKey } = req.params;
      if (!streamKey) {
        return res.status(400).json({
          success: false,
          message: 'Stream key is required',
        });
      }

      const session = await streamSessionService.getLiveSessionByStreamKey(streamKey);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Live session not found',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get live session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 