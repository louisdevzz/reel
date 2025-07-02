import { Router } from 'express'
import { ViewController } from '../controllers/viewController'

const router = Router()
const viewController = new ViewController()

// POST /api/views/videos/:contentId - Track video view
router.post('/videos/:contentId', async (req, res) => {
  await viewController.trackView(req, res)
})

// POST /api/views/shorts/:contentId - Track short view
router.post('/shorts/:contentId', async (req, res) => {
  await viewController.trackView(req, res)
})

// PUT /api/views/:viewId - Update view progress
router.put('/:viewId', async (req, res) => {
  await viewController.updateView(req, res)
})

// GET /api/views/videos/:contentId/stats - Get video view statistics
router.get('/videos/:contentId/stats', async (req, res) => {
  await viewController.getViewStats(req, res)
})

// GET /api/views/shorts/:contentId/stats - Get short view statistics
router.get('/shorts/:contentId/stats', async (req, res) => {
  await viewController.getViewStats(req, res)
})

// GET /api/views/videos/:contentId - Get video views
router.get('/videos/:contentId', async (req, res) => {
  await viewController.getContentViews(req, res)
})

// GET /api/views/shorts/:contentId - Get short views
router.get('/shorts/:contentId', async (req, res) => {
  await viewController.getContentViews(req, res)
})

// GET /api/views/user/:userId/history - Get user view history
router.get('/user/:userId/history', async (req, res) => {
  await viewController.getUserViewHistory(req, res)
})

// POST /api/views/queue/videos/process - Process video view queue
router.post('/queue/videos/process', async (req, res) => {
  await viewController.processViewQueue(req, res)
})

// POST /api/views/queue/shorts/process - Process short view queue
router.post('/queue/shorts/process', async (req, res) => {
  await viewController.processViewQueue(req, res)
})

// GET /api/views/health - Health check
router.get('/health', async (req, res) => {
  await viewController.healthCheck(req, res)
})

export default router 