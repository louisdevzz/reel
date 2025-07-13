import { Router } from 'express'
import { VideoController } from '../controllers/videoController'
import multer from 'multer'

const router = Router()
const videoController = new VideoController()

// Upload video file
router.post('/upload/file', (req, res, next) => {
  videoController.uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File upload error: File size limit exceeded. Please try with a smaller file.' });
      }
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    // Everything went fine, proceed to the controller
    next();
  });
}, async (req, res) => {
  await videoController.uploadVideoFile(req, res)
})

// Proxy endpoint để stream video từ R2 (giải quyết vấn đề CORS)
router.get('/proxy/:videoId', async (req, res) => {
  await videoController.proxyVideo(req, res)
})

// Get all shorts
router.get('/shorts', async (req, res) => {
  await videoController.getAllShorts(req, res)
})

// Get shorts with pagination
router.get('/shorts/paginated', async (req, res) => {
  await videoController.getShortsWithPagination(req, res)
})

// Get shorts around a specific video
router.get('/shorts/around/:videoId', async (req, res) => {
  await videoController.getShortsAroundVideo(req, res)
})

// Get shorts by user
router.get('/shorts/user/:userId', async (req, res) => {
  await videoController.getShortsByUser(req, res)
})

// Get short by ID
router.get('/shorts/:id', async (req, res) => {
  await videoController.getShortById(req, res)
})

// Get videos by user
router.get('/user/:userId', async (req, res) => {
  await videoController.getVideosByUser(req, res)
})

// Get all videos
router.get('/', async (req, res) => {
  await videoController.getAllVideos(req, res)
})

// Get video by ID (đặt sau các route khác để tránh xung đột)
router.get('/:id', async (req, res) => {
  await videoController.getVideoById(req, res)
})

// Delete all videos and shorts
router.delete('/all', async (req, res) => {
  await videoController.deleteAllVideos(req, res)
})

// Delete individual video
router.delete('/:id', async (req, res) => {
  await videoController.deleteVideo(req, res)
})

// Delete individual short
router.delete('/shorts/:id', async (req, res) => {
  await videoController.deleteShort(req, res)
})

export default router 