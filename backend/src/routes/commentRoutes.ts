import { Router } from 'express'
import { CommentController } from '../controllers/commentController'

const router = Router()
const commentController = new CommentController()

// Video Comments
// POST /api/comments/videos/:videoId - Add video comment
router.post('/videos/:videoId', async (req, res) => {
  await commentController.addVideoComment(req, res)
})

// DELETE /api/comments/videos/:commentId - Remove video comment
router.delete('/videos/:commentId', async (req, res) => {
  await commentController.removeVideoComment(req, res)
})

// GET /api/comments/videos/:videoId - Get video comments
router.get('/videos/:videoId', async (req, res) => {
  await commentController.getVideoComments(req, res)
})

// PUT /api/comments/videos/:commentId - Update video comment
router.put('/videos/:commentId', async (req, res) => {
  await commentController.updateVideoComment(req, res)
})

// Short Comments
// POST /api/comments/shorts/:shortId - Add short comment
router.post('/shorts/:shortId', async (req, res) => {
  await commentController.addShortComment(req, res)
})

// DELETE /api/comments/shorts/:commentId - Remove short comment
router.delete('/shorts/:commentId', async (req, res) => {
  await commentController.removeShortComment(req, res)
})

// GET /api/comments/shorts/:shortId - Get short comments
router.get('/shorts/:shortId', async (req, res) => {
  await commentController.getShortComments(req, res)
})

// PUT /api/comments/shorts/:commentId - Update short comment
router.put('/shorts/:commentId', async (req, res) => {
  await commentController.updateShortComment(req, res)
})

export default router 