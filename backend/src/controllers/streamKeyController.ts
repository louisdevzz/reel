import type { Request, Response } from 'express';
import { streamKeyService } from '../services/streamKeyService';
import type { CreateStreamKeyRequest, UpdateStreamKeyRequest } from '../types';

export class StreamKeyController {
  // Get all stream keys
  async getAllStreamKeys(req: Request, res: Response) {
    try {
      const streamKeys = streamKeyService.getAllStreamKeys();
      res.json({
        success: true,
        data: streamKeys,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stream keys',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get stream key by ID
  async getStreamKeyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }
      const streamKey = streamKeyService.getStreamKeyById(id);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      res.json({
        success: true,
        data: streamKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new stream key
  async createStreamKey(req: Request, res: Response) {
    try {
      const data: CreateStreamKeyRequest = req.body;
      
      if (!data.name) {
        return res.status(400).json({
          success: false,
          message: 'Stream key name is required',
        });
      }

      const streamKey = streamKeyService.createStreamKey(data);
      res.status(201).json({
        success: true,
        data: streamKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update stream key
  async updateStreamKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }
      const data: UpdateStreamKeyRequest = req.body;
      
      const updatedStreamKey = streamKeyService.updateStreamKey(id, data);
      
      if (!updatedStreamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      res.json({
        success: true,
        data: updatedStreamKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete stream key
  async deleteStreamKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }
      const deleted = streamKeyService.deleteStreamKey(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      res.json({
        success: true,
        message: 'Stream key deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Activate stream key
  async activateStreamKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }
      const streamKey = streamKeyService.activateStreamKey(id);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      res.json({
        success: true,
        data: streamKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to activate stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Deactivate stream key
  async deactivateStreamKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }
      const streamKey = streamKeyService.deactivateStreamKey(id);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      res.json({
        success: true,
        data: streamKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 