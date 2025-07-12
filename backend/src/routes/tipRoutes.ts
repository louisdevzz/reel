import { Router } from 'express'
import { TipController } from '../controllers/tipController'

const router = Router()
const tipController = new TipController()

// Create a new tip
router.post('/', async (req, res) => {
  await tipController.createTip(req, res)
})

// Get tips sent by user
router.get('/sent/:userId', async (req, res) => {
  await tipController.getTipsSentByUser(req, res)
})

// Get tips received by user
router.get('/received/:userId', async (req, res) => {
  await tipController.getTipsReceivedByUser(req, res)
})

// Get user tip statistics
router.get('/stats/:userId', async (req, res) => {
  await tipController.getUserTipStats(req, res)
})

// Get tips for a specific stream session
router.get('/stream/:streamSessionId', async (req, res) => {
  await tipController.getTipsForStreamSession(req, res)
})

// Get tips for a specific video
router.get('/video/:videoId', async (req, res) => {
  await tipController.getTipsForVideo(req, res)
})

// Get tips for a specific short
router.get('/short/:shortId', async (req, res) => {
  await tipController.getTipsForShort(req, res)
})

// Get recent tips (public)
router.get('/recent', async (req, res) => {
  await tipController.getRecentTips(req, res)
})

// Update tip status (admin/owner only)
router.patch('/:id/status', async (req, res) => {
  await tipController.updateTipStatus(req, res)
})

// Update tip transaction hash (admin/owner only)
router.patch('/:id/txhash', async (req, res) => {
  await tipController.updateTipTxHash(req, res)
})

// Confirm tip and update stats (admin/owner only)
router.post('/:id/confirm', async (req, res) => {
  await tipController.confirmTipAndUpdateStats(req, res)
})

// Delete tip (admin only)
router.delete('/:id', async (req, res) => {
  await tipController.deleteTip(req, res)
})

// Get tip by ID (must come after specific routes)
router.get('/:id', async (req, res) => {
  await tipController.getTipById(req, res)
})

export default router 