import { Router } from 'express'
import { AnalyticsController } from '../controllers/analyticsController'

const router = Router()
const analyticsController = new AnalyticsController()

// GET /api/analytics/:contentType/:contentId - Get content analytics
router.get('/:contentType/:contentId', async (req, res) => {
  await analyticsController.getContentAnalytics(req, res)
})

// GET /api/analytics/user/:userId - Get user analytics
router.get('/user/:userId', async (req, res) => {
  await analyticsController.getUserAnalytics(req, res)
})

// GET /api/analytics/platform - Get platform analytics
router.get('/platform', async (req, res) => {
  await analyticsController.getPlatformAnalytics(req, res)
})

export default router 