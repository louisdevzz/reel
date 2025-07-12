import { db } from '../../db'
import { transactions, users } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { NewTransaction, Transaction } from '../../db/schema'

export class TransactionService {
  // Create a new transaction
  async createTransaction(data: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return transaction!
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))

    return transaction || null
  }

  // Get transaction by transaction hash
  async getTransactionByTxHash(txHash: string): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.txHash, txHash))

    return transaction || null
  }

  // Get all transactions for a user
  async getUserTransactions(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Get all transactions with pagination
  async getAllTransactions(limit = 20, offset = 0, status?: string, type?: string): Promise<Transaction[]> {
    const conditions = []
    
    if (status) {
      conditions.push(eq(transactions.status, status))
    }
    
    if (type) {
      conditions.push(eq(transactions.type, type))
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset)
    }

    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Update transaction status
  async updateTransactionStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<Transaction | null> {
    const [transaction] = await db
      .update(transactions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()

    return transaction || null
  }

  // Update user balance when transaction is confirmed
  async confirmTransactionAndUpdateBalance(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the transaction
      const transaction = await this.getTransactionById(transactionId)
      if (!transaction) {
        return { success: false, error: 'Transaction not found' }
      }

      if (transaction.status !== 'pending') {
        return { success: false, error: 'Transaction is not in pending status' }
      }

      // Only allow deposit, withdraw, and reward transactions
      if (!['deposit', 'withdraw', 'reward'].includes(transaction.type)) {
        return { success: false, error: 'Transaction type not supported for balance update' }
      }

      // Update transaction status to confirmed
      await this.updateTransactionStatus(transactionId, 'confirmed')

      // Get current user balance
      const [currentUser] = await db
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, transaction.userId))

      if (!currentUser) {
        return { success: false, error: 'User not found' }
      }

      let newBalance = currentUser.balance || 0

      // Update balance based on transaction type
      switch (transaction.type) {
        case 'deposit':
          newBalance += transaction.amount
          break
        case 'withdraw':
          // Check if user has enough balance
          if (newBalance < transaction.amount) {
            // Revert transaction status back to pending
            await this.updateTransactionStatus(transactionId, 'pending')
            return { success: false, error: 'Insufficient balance for withdrawal' }
          }
          newBalance -= transaction.amount
          break
        case 'reward':
          newBalance += transaction.amount
          break
        default:
          return { success: false, error: 'Unsupported transaction type' }
      }

      // Update user balance
      await db
        .update(users)
        .set({
          balance: newBalance,
        })
        .where(eq(users.id, transaction.userId))

      return { success: true }
    } catch (error) {
      console.error('Error confirming transaction:', error)
      return { success: false, error: 'Failed to confirm transaction' }
    }
  }

  // Get transaction statistics for a user
  async getUserTransactionStats(userId: string): Promise<{
    totalTransactions: number
    totalAmount: number
    pendingAmount: number
    confirmedAmount: number
    failedAmount: number
    deposits: number
    withdrawals: number
  }> {
    const transactions = await this.getUserTransactions(userId, 1000, 0)

    const stats = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      pendingAmount: 0,
      confirmedAmount: 0,
      failedAmount: 0,
      deposits: 0,
      withdrawals: 0,
    }

    transactions.forEach(transaction => {
      if (transaction.type === 'deposit') {
        stats.totalAmount += transaction.amount
        stats.deposits += 1
      } else if (transaction.type === 'withdraw') {
        stats.totalAmount -= transaction.amount
        stats.withdrawals += 1
      }
      
      switch (transaction.status) {
        case 'pending':
          stats.pendingAmount += transaction.amount
          break
        case 'confirmed':
          stats.confirmedAmount += transaction.amount
          break
        case 'failed':
          stats.failedAmount += transaction.amount
          break
      }
    })

    return stats
  }

  // Get all pending transactions
  async getPendingTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(desc(transactions.createdAt))
  }

  // Check if transaction hash already exists
  async isTransactionHashExists(txHash: string): Promise<boolean> {
    const transaction = await this.getTransactionByTxHash(txHash)
    return !!transaction
  }
} 