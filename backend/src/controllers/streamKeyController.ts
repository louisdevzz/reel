import { streamKeyService } from '../services/streamKeyService';
import type { Request, Response } from 'express';
import type { CreateStreamKeyRequest, UpdateStreamKeyRequest } from '../types';
import type { AuthenticatedRequest } from '../types';

export class StreamKeyController {
  // Get all stream keys
  async getAllStreamKeys(req: Request, res: Response) {
    try {
      const streamKeys = await streamKeyService.getAllStreamKeys();
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
      const streamKey = await streamKeyService.getStreamKeyById(id);
      
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

  // Get stream key by username
  async getStreamKeyByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required',
        });
      }
      const streamKey = await streamKeyService.getStreamKeyByUsername(username);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found for this username',
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

  // Get stream key by user ID (current user's stream key)
  async getStreamKeyByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }
      const streamKey = await streamKeyService.getStreamKeyByUserId(userId);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found for this user',
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

  // Get stream key by key value
  async getStreamKeyByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Stream key is required',
        });
      }
      const streamKey = await streamKeyService.getStreamKeyByKey(key);
      
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
      const { name, userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Stream key name is required',
        });
      }

      const streamKey = await streamKeyService.createStreamKey({ name }, userId);
      res.status(201).json({
        success: true,
        data: streamKey,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User already has a stream key') {
        return res.status(400).json({
          success: false,
          message: 'User already has a stream key',
        });
      }
      
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
      const data = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }

      const updatedStreamKey = await streamKeyService.updateStreamKey(id, data);
      
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

      const deleted = await streamKeyService.deleteStreamKey(id);
      
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

      const streamKey = await streamKeyService.activateStreamKey(id);
      
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

      const streamKey = await streamKeyService.deactivateStreamKey(id);
      
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

  // Regenerate stream key
  async regenerateStreamKey(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }

      const streamKey = await streamKeyService.regenerateStreamKey(id);
      
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
        message: 'Failed to regenerate stream key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get streaming information for a stream key
  async getStreamingInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Stream key ID is required',
        });
      }

      const streamKey = await streamKeyService.getStreamKeyById(id);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found',
        });
      }

      // Get Livepeer streaming URLs
      const rtmpUrl = streamKeyService.getRtmpUrl();
      const webRtcUrl = streamKeyService.getWebRtcUrl(streamKey.key);

      res.json({
        success: true,
        data: {
          streamKey: streamKey.key,
          rtmpUrl,
          webRtcUrl,
          playbackUrl: streamKey.playbackUrl,
          streamId: streamKey.livepeerStreamId,
          playbackId: streamKey.playbackId,
          isActive: streamKey.isActive,
          isLive: streamKey.isLive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get streaming information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get streaming information by username
  async getStreamingInfoByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required',
        });
      }

      const streamKey = await streamKeyService.getStreamKeyByUsername(username);
      
      if (!streamKey) {
        return res.status(404).json({
          success: false,
          message: 'Stream key not found for this username',
        });
      }

      // Get Livepeer streaming URLs
      const rtmpUrl = streamKeyService.getRtmpUrl();
      const webRtcUrl = streamKeyService.getWebRtcUrl(streamKey.key);

      res.json({
        success: true,
        data: {
          streamKey: streamKey.key,
          rtmpUrl,
          webRtcUrl,
          playbackUrl: streamKey.playbackUrl,
          streamId: streamKey.livepeerStreamId,
          playbackId: streamKey.playbackId,
          isActive: streamKey.isActive,
          isLive: streamKey.isLive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get streaming information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get Livepeer stream status
  async getLivepeerStreamStatus(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      console.log(`🔍 Checking Livepeer status for stream: ${streamId}`);
      const streamStatus = await streamKeyService.getStreamStatus(streamId);
      
      if (!streamStatus) {
        console.log(`❌ Stream not found on Livepeer: ${streamId}`);
        return res.status(404).json({
          success: false,
          message: 'Stream not found on Livepeer',
        });
      }

      const result = {
        isActive: streamStatus.isActive || false,
        isLive: streamStatus.isLive || false,
      };

      console.log(`✅ Livepeer status for ${streamId}:`, result);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(`❌ Error getting Livepeer status for ${req.params.streamId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Livepeer stream status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get Livepeer stream info
  async getLivepeerStreamInfo(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream ID is required',
        });
      }

      const streamStatus = await streamKeyService.getStreamStatus(streamId);
      
      if (!streamStatus) {
        return res.status(404).json({
          success: false,
          message: 'Stream not found on Livepeer',
        });
      }

      // In Livepeer, the stream ID is actually the playback ID for HLS URLs
      // The playback URL format is: https://livepeercdn.studio/hls/{playbackId}/index.m3u8
      const playbackId = streamStatus.id; // This is the actual playback ID
      const playbackUrl = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;

      res.json({
        success: true,
        data: {
          streamId: streamStatus.id,
          playbackId: playbackId,
          playbackUrl: playbackUrl,
          isActive: streamStatus.isActive || false,
          isLive: streamStatus.isLive || false,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get Livepeer stream info',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get Livepeer stream info by playback ID
  async getLivepeerStreamInfoByPlaybackId(req: Request, res: Response) {
    try {
      const { playbackId } = req.params;
      
      if (!playbackId) {
        return res.status(400).json({
          success: false,
          message: 'Playback ID is required',
        });
      }

      // For Livepeer, the playback ID is the same as the stream ID
      // So we can use the same method to get stream status
      const streamStatus = await streamKeyService.getStreamStatus(playbackId);
      
      if (!streamStatus) {
        return res.status(404).json({
          success: false,
          message: 'Stream not found on Livepeer',
        });
      }

      const playbackUrl = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;

      res.json({
        success: true,
        data: {
          streamId: streamStatus.id,
          playbackId: playbackId,
          playbackUrl: playbackUrl,
          isActive: streamStatus.isActive || false,
          isLive: streamStatus.isLive || false,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get Livepeer stream info',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 