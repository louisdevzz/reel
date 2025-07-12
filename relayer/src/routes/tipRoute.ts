import { Router } from 'express'
import { tipController } from '../controllers/tipController'

const router = Router()

// Send a tip
router.post('/send', async (req, res) => {
    await tipController.sendTip(req, res)
})

// Get tip history for a user
router.get('/history/:address', async (req, res) => {
    await tipController.getTipHistory(req, res)
})

// Get received tips for a user
router.get('/received/:address', async (req, res) => {
    await tipController.getReceivedTips(req, res)
})

// Get sent tips for a user
router.get('/sent/:address', async (req, res) => {
    await tipController.getSentTips(req, res)
})

// Get total tips received by a user
router.get('/total-received/:address', async (req, res) => {
    await tipController.getTotalTipsReceived(req, res)
})

// Get total tips sent by a user
router.get('/total-sent/:address', async (req, res) => {
    await tipController.getTotalTipsSent(req, res)
})

// Get tip statistics for a user (both received and sent)
router.get('/stats/:address', async (req, res) => {
    await tipController.getTipStats(req, res)
})

export default router 