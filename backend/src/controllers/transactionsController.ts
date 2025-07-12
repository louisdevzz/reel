import type { Request, Response } from 'express'
import { TransactionService } from '../services/transactionsService'

const transactionService = new TransactionService()

export class TransactionController {
  // Create a new transaction
  async createTransaction(req: Request, res: Response) {
    try {
      const {
        userId,
        amount,
        type,
        txHash,
        userAddr,
        referralCode,
      } = req.body

      // Validate required fields
      if (!userId || !amount || !type || !txHash || !userAddr) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, amount, type, txHash, userAddr',
        })
      }

      // Validate transaction type
      if (!['deposit', 'withdraw', 'transfer', 'reward', 'fee', 'other'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction type. Must be one of: deposit, withdraw, transfer, reward, fee, other',
        })
      }

      // Check if transaction hash already exists
      const existingTransaction = await transactionService.isTransactionHashExists(txHash)
      if (existingTransaction) {
        return res.status(409).json({
          success: false,
          error: 'Transaction hash already exists',
        })
      }

      // Create the transaction
      const transaction = await transactionService.createTransaction({
        userId,
        amount,
        type,
        txHash,
        userAddr,
        referralCode,
      })

      res.status(201).json({
        success: true,
        data: transaction,
      })
    } catch (error) {
      console.error('Error creating transaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get transaction by ID
  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required',
        })
      }

      const transaction = await transactionService.getTransactionById(id)
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        })
      }

      res.json({
        success: true,
        data: transaction,
      })
    } catch (error) {
      console.error('Error getting transaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get transaction by transaction hash
  async getTransactionByTxHash(req: Request, res: Response) {
    try {
      const { txHash } = req.params

      if (!txHash) {
        return res.status(400).json({
          success: false,
          error: 'Transaction hash is required',
        })
      }

      const transaction = await transactionService.getTransactionByTxHash(txHash)
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        })
      }

      res.json({
        success: true,
        data: transaction,
      })
    } catch (error) {
      console.error('Error getting transaction by hash:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get user's transactions
  async getUserTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        })
      }

      const transactions = await transactionService.getUserTransactions(userId, limit, offset)

      res.json({
        success: true,
        data: transactions,
        pagination: {
          limit,
          offset,
          count: transactions.length,
        },
      })
    } catch (error) {
      console.error('Error getting user transactions:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get all transactions (admin only)
  async getAllTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0
      const status = req.query.status as string
      const type = req.query.type as string

      const transactions = await transactionService.getAllTransactions(limit, offset, status, type)

      res.json({
        success: true,
        data: transactions,
        pagination: {
          limit,
          offset,
          count: transactions.length,
        },
      })
    } catch (error) {
      console.error('Error getting all transactions:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Update transaction status
  async updateTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required',
        })
      }

      // Validate status
      if (!['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: pending, confirmed, failed',
        })
      }

      const transaction = await transactionService.updateTransactionStatus(id, status)
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        })
      }

      res.json({
        success: true,
        data: transaction,
      })
    } catch (error) {
      console.error('Error updating transaction status:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Confirm transaction and update user balance
  async confirmTransactionAndUpdateBalance(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required',
        })
      }

      const result = await transactionService.confirmTransactionAndUpdateBalance(id)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        })
      }

      res.json({
        success: true,
        message: 'Transaction confirmed and balance updated successfully',
      })
    } catch (error) {
      console.error('Error confirming transaction:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get user's transaction statistics
  async getUserTransactionStats(req: Request, res: Response) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        })
      }

      const stats = await transactionService.getUserTransactionStats(userId)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error getting user transaction stats:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  // Get pending transactions (admin only)
  async getPendingTransactions(req: Request, res: Response) {
    try {
      const transactions = await transactionService.getPendingTransactions()

      res.json({
        success: true,
        data: transactions,
        count: transactions.length,
      })
    } catch (error) {
      console.error('Error getting pending transactions:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
} 