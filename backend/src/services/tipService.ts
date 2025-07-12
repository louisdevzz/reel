import { db } from '../../db'
import { tipHistory, users, streamSessions, videos, shorts } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { NewTipHistory, TipHistory } from '../../db/schema'

export class TipService {
  // Create a new tip
  async createTip(tipData: Omit<NewTipHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<TipHistory> {
    const [newTip] = await db.insert(tipHistory).values({
      ...tipData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    if (!newTip) {
      throw new Error('Failed to create tip')
    }

    return newTip
  }

  // Get tip by ID
  async getTipById(id: string): Promise<TipHistory | null> {
    const [tip] = await db.select().from(tipHistory).where(eq(tipHistory.id, id))
    return tip || null
  }

  // Get tips sent by a user
  async getTipsSentByUser(userId: string, limit = 20, offset = 0): Promise<TipHistory[]> {
    return await db.select().from(tipHistory)
      .where(eq(tipHistory.tipperId, userId))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Get tips received by a user
  async getTipsReceivedByUser(userId: string, limit = 20, offset = 0): Promise<TipHistory[]> {
    return await db.select().from(tipHistory)
      .where(eq(tipHistory.receiverId, userId))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Get tips for a specific stream session
  async getTipsForStreamSession(streamSessionId: string, limit = 50, offset = 0): Promise<TipHistory[]> {
    return await db.select().from(tipHistory)
      .where(eq(tipHistory.streamSessionId, streamSessionId))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Get tips for a specific video
  async getTipsForVideo(videoId: string, limit = 50, offset = 0): Promise<TipHistory[]> {
    return await db.select().from(tipHistory)
      .where(eq(tipHistory.videoId, videoId))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Get tips for a specific short
  async getTipsForShort(shortId: string, limit = 50, offset = 0): Promise<TipHistory[]> {
    return await db.select().from(tipHistory)
      .where(eq(tipHistory.shortId, shortId))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // Update tip status
  async updateTipStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<TipHistory | null> {
    const [updatedTip] = await db.update(tipHistory)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tipHistory.id, id))
      .returning()

    return updatedTip || null
  }

  // Update tip transaction hash
  async updateTipTxHash(id: string, txHash: string): Promise<TipHistory | null> {
    const [updatedTip] = await db.update(tipHistory)
      .set({
        txHash,
        updatedAt: new Date(),
      })
      .where(eq(tipHistory.id, id))
      .returning()

    return updatedTip || null
  }

  // Confirm tip and update user stats and balance
  async confirmTipAndUpdateStats(tipId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the tip
      const tip = await this.getTipById(tipId)
      if (!tip) {
        return { success: false, error: 'Tip not found' }
      }

      if (tip.status !== 'pending') {
        return { success: false, error: 'Tip is not in pending status' }
      }

      // Get current tipper and receiver user data
      const [currentTipper] = await db
        .select({ 
          balance: users.balance,
          totalDonation: users.totalDonation,
          totalDonationCount: users.totalDonationCount
        })
        .from(users)
        .where(eq(users.id, tip.tipperId))

      const [currentReceiver] = await db
        .select({ 
          balance: users.balance,
          totalDonation: users.totalDonation,
          totalDonationCount: users.totalDonationCount
        })
        .from(users)
        .where(eq(users.id, tip.receiverId))

      if (!currentTipper) {
        return { success: false, error: 'Tipper user not found' }
      }

      if (!currentReceiver) {
        return { success: false, error: 'Receiver user not found' }
      }

      // Check if tipper has sufficient balance
      if ((currentTipper.balance || 0) < tip.amount) {
        return { success: false, error: 'Insufficient balance' }
      }

      // Update tip status to confirmed
      await this.updateTipStatus(tipId, 'confirmed')

      // Calculate new values for tipper (deduct balance only)
      const newTipperBalance = (currentTipper.balance || 0) - tip.amount

      // Calculate new values for receiver (add balance and donation stats)
      const newReceiverBalance = (currentReceiver.balance || 0) + tip.amount
      const newReceiverTotalDonation = (currentReceiver.totalDonation || 0) + tip.amount
      const newReceiverTotalDonationCount = (currentReceiver.totalDonationCount || 0) + 1

      // Update tipper's balance only
      await db
        .update(users)
        .set({
          balance: newTipperBalance,
        })
        .where(eq(users.id, tip.tipperId))

      // Update receiver's balance and donation stats
      await db
        .update(users)
        .set({
          balance: newReceiverBalance,
          totalDonation: newReceiverTotalDonation,
          totalDonationCount: newReceiverTotalDonationCount,
        })
        .where(eq(users.id, tip.receiverId))

      // If tip is for a stream session, update stream session stats
      if (tip.streamSessionId) {
        const [currentStreamSession] = await db
          .select({ 
            totalDonation: streamSessions.totalDonation,
            totalDonationCount: streamSessions.totalDonationCount
          })
          .from(streamSessions)
          .where(eq(streamSessions.id, tip.streamSessionId))

        if (currentStreamSession) {
          const newStreamTotalDonation = (currentStreamSession.totalDonation || 0) + tip.amount
          const newStreamTotalDonationCount = (currentStreamSession.totalDonationCount || 0) + 1

          await db
            .update(streamSessions)
            .set({
              totalDonation: newStreamTotalDonation,
              totalDonationCount: newStreamTotalDonationCount,
              updatedAt: new Date(),
            })
            .where(eq(streamSessions.id, tip.streamSessionId))
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error confirming tip:', error)
      return { success: false, error: 'Failed to confirm tip' }
    }
  }

  // Get tip statistics for a user
  async getUserTipStats(userId: string): Promise<{
    totalTipsSent: number
    totalTipsReceived: number
    totalAmountSent: number
    totalAmountReceived: number
    averageTipSent: number
    averageTipReceived: number
  }> {
    const sentStats = await db.select({
      totalTipsSent: sql<number>`count(*)`,
      totalAmountSent: sql<number>`coalesce(sum(amount), 0)`,
      averageTipSent: sql<number>`coalesce(avg(amount), 0)`,
    }).from(tipHistory)
      .where(and(
        eq(tipHistory.tipperId, userId),
        eq(tipHistory.status, 'confirmed')
      ))

    const receivedStats = await db.select({
      totalTipsReceived: sql<number>`count(*)`,
      totalAmountReceived: sql<number>`coalesce(sum(amount), 0)`,
      averageTipReceived: sql<number>`coalesce(avg(amount), 0)`,
    }).from(tipHistory)
      .where(and(
        eq(tipHistory.receiverId, userId),
        eq(tipHistory.status, 'confirmed')
      ))

    const sent = sentStats[0] || { totalTipsSent: 0, totalAmountSent: 0, averageTipSent: 0 }
    const received = receivedStats[0] || { totalTipsReceived: 0, totalAmountReceived: 0, averageTipReceived: 0 }

    return {
      totalTipsSent: Number(sent.totalTipsSent) || 0,
      totalTipsReceived: Number(received.totalTipsReceived) || 0,
      totalAmountSent: Number(sent.totalAmountSent) || 0,
      totalAmountReceived: Number(received.totalAmountReceived) || 0,
      averageTipSent: Number(sent.averageTipSent) || 0,
      averageTipReceived: Number(received.averageTipReceived) || 0,
    }
  }

  // Get recent tips with user details
  async getRecentTipsWithUsers(limit = 20): Promise<TipHistory[]> {
    const tips = await db.select().from(tipHistory)
      .where(eq(tipHistory.status, 'confirmed'))
      .orderBy(desc(tipHistory.createdAt))
      .limit(limit)

    return tips
  }

  // Get tip with context (simplified version)
  async getTipWithContext(tipId: string): Promise<TipHistory | null> {
    const [tip] = await db.select().from(tipHistory)
      .where(eq(tipHistory.id, tipId))

    return tip || null
  }

  // Delete tip (admin only)
  async deleteTip(id: string): Promise<boolean> {
    const [deletedTip] = await db.delete(tipHistory)
      .where(eq(tipHistory.id, id))
      .returning()

    return !!deletedTip
  }
}

export const tipService = new TipService() 