import { Router } from 'express'
import { ShareController } from '../controllers/shareController'

const router = Router()
const shareController = new ShareController()

// Video Shares
// POST /api/shares/videos/:videoId - Add video share
router.post('/videos/:videoId', async (req, res) => {
  await shareController.addVideoShare(req, res)
})

// GET /api/shares/videos/:videoId - Get video shares
router.get('/videos/:videoId', async (req, res) => {
  await shareController.getVideoShares(req, res)
})

// GET /api/shares/videos/:videoId/stats - Get video share statistics
router.get('/videos/:videoId/stats', async (req, res) => {
  await shareController.getVideoShareStats(req, res)
})

// GET /api/shares/user/:userId/videos - Get user's video shares
router.get('/user/:userId/videos', async (req, res) => {
  await shareController.getUserVideoShares(req, res)
})

// Short Shares
// POST /api/shares/shorts/:shortId - Add short share
router.post('/shorts/:shortId', async (req, res) => {
  await shareController.addShortShare(req, res)
})

// GET /api/shares/shorts/:shortId - Get short shares
router.get('/shorts/:shortId', async (req, res) => {
  await shareController.getShortShares(req, res)
})

// GET /api/shares/shorts/:shortId/stats - Get short share statistics
router.get('/shorts/:shortId/stats', async (req, res) => {
  await shareController.getShortShareStats(req, res)
})

// GET /api/shares/user/:userId/shorts - Get user's short shares
router.get('/user/:userId/shorts', async (req, res) => {
  await shareController.getUserShortShares(req, res)
})

export default router 