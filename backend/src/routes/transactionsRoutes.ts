import { Router } from 'express'
import { TransactionController } from '../controllers/transactionsController'

const router = Router()
const transactionController = new TransactionController()

// Create a new transaction
router.post('/', async (req, res) => {
  await transactionController.createTransaction(req, res)
})

// Get all transactions (admin only) - must come before /:id
router.get('/', async (req, res) => {
  await transactionController.getAllTransactions(req, res)
})

// Get pending transactions (admin only)
router.get('/pending/all', async (req, res) => {
  await transactionController.getPendingTransactions(req, res)
})

// Get user's transactions
router.get('/user/:userId', async (req, res) => {
  await transactionController.getUserTransactions(req, res)
})

// Get user's transaction statistics
router.get('/user/:userId/stats', async (req, res) => {
  await transactionController.getUserTransactionStats(req, res)
})

// Get transaction by transaction hash
router.get('/hash/:txHash', async (req, res) => {
  await transactionController.getTransactionByTxHash(req, res)
})

// Get transaction by ID - must come after specific routes
router.get('/:id', async (req, res) => {
  await transactionController.getTransactionById(req, res)
})

// Update transaction status
router.patch('/:id/status', async (req, res) => {
  await transactionController.updateTransactionStatus(req, res)
})

// Confirm transaction and update user balance
router.post('/:id/confirm', async (req, res) => {
  await transactionController.confirmTransactionAndUpdateBalance(req, res)
})

export default router 