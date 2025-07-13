import type { Request, Response } from 'express'
import { VideoService } from '../services/videoService'
import type { UploadVideoRequest } from '../services/videoService'
import { R2Service } from '../services/r2Service'
import multer from 'multer'

// Configure multer for memory storage without file size limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Infinity, // No file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video files are allowed'))
    }
  }
})

// Initialize R2 service (you'll need to add these to your .env file)
const r2Service = new R2Service({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME || '',
  publicUrl: process.env.CLOUDFLARE_PUBLIC_URL || 'https://pub-3fc9ba06a236476a952e34beb065779f.r2.dev',
})

const videoService = new VideoService()

export class VideoController {
  // Middleware for file upload
  uploadMiddleware = upload.single('video')

  async uploadVideo(req: Request, res: Response) {
    try {
      const { title, description, duration, thumbnail, videoUrl, tags, isPublic } = req.body
      const userId = req.body.userId // In a real app, this would come from authentication

      console.log('duration', duration)

      if (!title || !duration || !thumbnail || !videoUrl || !userId) {
        return res.status(400).json({
          error: 'Missing required fields: title, duration, thumbnail, videoUrl, userId'
        })
      }

      const uploadData: UploadVideoRequest = {
        title,
        description,
        duration: Number(duration),
        thumbnail,
        videoUrl,
        userId,
        tags,
        isPublic
      }

      const result = await videoService.uploadVideo(uploadData)

      res.status(201).json({
        success: true,
        data: result,
        message: `Video uploaded successfully as ${result.type}`
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      res.status(500).json({
        error: 'Failed to upload video',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async uploadVideoFile(req: Request, res: Response) {
    try {
      const file = req.file
      const { title, description, duration, tags, isPublic, userId } = req.body

      if (!file) {
        return res.status(400).json({ error: 'No video file provided' })
      }

      if (!title || !userId) {
        return res.status(400).json({
          error: 'Missing required fields: title, userId'
        })
      }

      // Set timeout for the entire operation
      const timeout = setTimeout(() => {
        res.status(408).json({ error: 'Upload timeout - file too large or slow connection' })
      }, 1800000) // 30 minutes timeout for large files

      try {
        // Start upload to R2 immediately
        const uploadPromise = r2Service.uploadVideo(
          file.buffer,
          file.originalname,
          file.mimetype
        )

        // Wait for both operations
        const [videoUrl] = await Promise.all([uploadPromise])

        // Generate thumbnail asynchronously (don't wait for it)
        const thumbnailPromise = r2Service.generateThumbnail(videoUrl).catch(() => 
          `https://picsum.photos/320/180?random=${Date.now()}`
        )

        const uploadData: UploadVideoRequest = {
          title,
          description,
          duration,
          thumbnail: await thumbnailPromise,
          videoUrl,
          userId,
          tags: tags ? JSON.parse(tags) : undefined,
          isPublic: isPublic === 'true'
        }

        // Save to database
        const result = await videoService.uploadVideo(uploadData)

        clearTimeout(timeout)

        res.status(201).json({
          success: true,
          data: result,
          message: `Video uploaded successfully as ${result.type}`,
          videoUrl,
          thumbnail: uploadData.thumbnail
        })
      } catch (error) {
        clearTimeout(timeout)
        throw error
      }
    } catch (error) {
      console.error('Error uploading video file:', error)
      res.status(500).json({
        error: 'Failed to upload video file',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getVideosByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }
      const videos = await videoService.getVideosByUser(userId)
      res.json({ success: true, data: videos })
    } catch (error) {
      console.error('Error getting videos by user:', error)
      res.status(500).json({
        error: 'Failed to get videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getShortsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }
      const shorts = await videoService.getShortsByUser(userId)
      res.json({ success: true, data: shorts })
    } catch (error) {
      console.error('Error getting shorts by user:', error)
      res.status(500).json({
        error: 'Failed to get shorts',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getVideoById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'Video ID is required' })
      }
      const video = await videoService.getVideoById(id)
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' })
      }
      
      res.json({ success: true, data: video })
    } catch (error) {
      console.error('Error getting video by id:', error)
      res.status(500).json({
        error: 'Failed to get video',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getShortById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'Short ID is required' })
      }
      const short = await videoService.getShortById(id)
      
      if (!short) {
        return res.status(404).json({ error: 'Short not found' })
      }
      
      res.json({ success: true, data: short })
    } catch (error) {
      console.error('Error getting short by id:', error)
      res.status(500).json({
        error: 'Failed to get short',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getAllVideos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const videos = await videoService.getAllVideos(limit)
      res.json({ success: true, data: videos })
    } catch (error) {
      console.error('Error getting all videos:', error)
      res.status(500).json({
        error: 'Failed to get videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getAllShorts(req: Request, res: Response) {
    try {
      const shorts = await videoService.getAllShorts()
      console.log('Retrieved shorts:', shorts.length, 'shorts found')
      res.json({ success: true, data: shorts })
    } catch (error) {
      console.error('Error getting all shorts:', error)
      res.status(500).json({
        error: 'Failed to get shorts',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getShortsWithPagination(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0
      
      const shorts = await videoService.getShortsWithPagination(limit, offset)
      res.json({ success: true, data: shorts })
    } catch (error) {
      console.error('Error getting shorts with pagination:', error)
      res.status(500).json({
        error: 'Failed to get shorts',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getShortsAroundVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params
      const limit = parseInt(req.query.limit as string) || 10
      
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' })
      }
      
      const shorts = await videoService.getShortsAroundVideo(videoId, limit)
      res.json({ success: true, data: shorts })
    } catch (error) {
      console.error('Error getting shorts around video:', error)
      res.status(500).json({
        error: 'Failed to get shorts',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async proxyVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }
      
      // Lấy thông tin video từ database (tìm trong cả videos và shorts)
      const video = await videoService.getVideoByIdUniversal(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const videoUrl = video.videoUrl;
      
      // Fetch video từ R2
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        return res.status(404).json({ error: 'Video file not found on R2' });
      }

      // Set headers cho video streaming
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // Send video data
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Failed to stream video' });
    }
  }

  async deleteAllVideos(req: Request, res: Response) {
    try {
      const result = await videoService.deleteAllVideos()
      
      res.json({
        success: true,
        data: result,
        message: result.message
      })
    } catch (error) {
      console.error('Error deleting all videos:', error)
      res.status(500).json({
        error: 'Failed to delete all videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async deleteVideo(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { userId } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Video ID is required' })
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const result = await videoService.deleteVideo(id, userId)
      
      res.json({
        success: true,
        data: result,
        message: result.message
      })
    } catch (error) {
      console.error('Error deleting video:', error)
      res.status(500).json({
        error: 'Failed to delete video',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async deleteShort(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { userId } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Short ID is required' })
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const result = await videoService.deleteShort(id, userId)
      
      res.json({
        success: true,
        data: result,
        message: result.message
      })
    } catch (error) {
      console.error('Error deleting short:', error)
      res.status(500).json({
        error: 'Failed to delete short',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
} 