import { redisService } from './redisService'
import { viewService } from './viewService'
import { shareService } from './shareService'

class AnalyticsService {
  // Track view for analytics
  async trackView(contentId: string, contentType: 'video' | 'short', data: any) {
    try {
      // Update real-time analytics in Redis
      let analytics = await redisService.getCachedAnalytics(contentId, contentType) || {
        totalViews: 0,
        uniqueViews: 0,
        completedViews: 0,
        averageWatchDuration: 0,
        viewCount: 0,
        totalWatchTime: 0
      }

      // Update metrics
      analytics.viewCount += 1
      analytics.totalWatchTime += data.watchDuration || 0
      analytics.averageWatchDuration = Math.round(analytics.totalWatchTime / analytics.viewCount)

      if (data.isCompleted) {
        analytics.completedViews += 1
      }

      // Cache updated analytics
      await redisService.cacheAnalytics(contentId, contentType, analytics, 3600) // 1 hour TTL

      return analytics
    } catch (error) {
      console.error('Error tracking view analytics:', error)
      return null
    }
  }

  // Get comprehensive analytics for content
  async getContentAnalytics(contentId: string, contentType: 'video' | 'short') {
    try {
      // Try to get from cache first
      let analytics = await redisService.getCachedAnalytics(contentId, contentType)

      if (!analytics) {
        // Get from database
        const viewStats = await viewService.getViewStats(contentId, contentType)
        const shareStats = await shareService.getShareStats(contentId, contentType)

        analytics = {
          ...viewStats,
          ...shareStats,
          engagementRate: this.calculateEngagementRate(viewStats, shareStats),
          viewRetention: this.calculateViewRetention(viewStats),
          viralCoefficient: this.calculateViralCoefficient(viewStats, shareStats)
        }

        // Cache the result
        await redisService.cacheAnalytics(contentId, contentType, analytics, 3600)
      }

      return analytics
    } catch (error) {
      console.error('Error getting content analytics:', error)
      return null
    }
  }

  // Calculate engagement rate
  private calculateEngagementRate(viewStats: any, shareStats: any): number {
    const totalViews = viewStats.totalViews || 0
    const totalShares = shareStats.totalShares || 0
    
    if (totalViews === 0) return 0
    
    // Engagement rate = (likes + comments + shares) / views
    const engagement = (viewStats.likes || 0) + (viewStats.comments || 0) + totalShares
    return Math.round((engagement / totalViews) * 100 * 100) / 100 // Round to 2 decimal places
  }

  // Calculate view retention
  private calculateViewRetention(viewStats: any): number {
    const totalViews = viewStats.totalViews || 0
    const completedViews = viewStats.completedViews || 0
    
    if (totalViews === 0) return 0
    
    return Math.round((completedViews / totalViews) * 100 * 100) / 100 // Round to 2 decimal places
  }

  // Calculate viral coefficient
  private calculateViralCoefficient(viewStats: any, shareStats: any): number {
    const totalViews = viewStats.totalViews || 0
    const totalShares = shareStats.totalShares || 0
    
    if (totalViews === 0) return 0
    
    // Viral coefficient = shares / views
    return Math.round((totalShares / totalViews) * 100 * 100) / 100 // Round to 2 decimal places
  }

  // Get user analytics
  async getUserAnalytics(userId: string) {
    try {
      // Get user view history
      const viewHistory = await viewService.getUserViewHistory(userId, 100, 0)
      
      // Calculate user engagement metrics
      const totalViews = viewHistory.length
      const totalWatchTime = viewHistory.reduce((sum, item) => sum + (item.view.watchDuration || 0), 0)
      const averageWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0
      
      // Get user's shared content
      const videoShares = await shareService.getUserVideoShares(userId, 100, 0)
      const shortShares = await shareService.getUserShortShares(userId, 100, 0)
      
      const analytics = {
        totalViews,
        totalWatchTime,
        averageWatchTime,
        totalShares: videoShares.length + shortShares.length,
        favoriteCategories: this.getFavoriteCategories(viewHistory),
        watchPatterns: this.analyzeWatchPatterns(viewHistory),
        engagementScore: this.calculateUserEngagementScore(viewHistory, videoShares, shortShares)
      }

      return analytics
    } catch (error) {
      console.error('Error getting user analytics:', error)
      return null
    }
  }

  // Get favorite categories from view history
  private getFavoriteCategories(viewHistory: any[]): string[] {
    const categoryCount: { [key: string]: number } = {}
    
    viewHistory.forEach(item => {
      const category = item.video?.category || item.short?.category || 'Unknown'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)
  }

  // Analyze watch patterns
  private analyzeWatchPatterns(viewHistory: any[]): any {
    const patterns = {
      averageSessionLength: 0,
      preferredContentType: '',
      peakWatchingHours: [] as number[],
      completionRate: 0
    }
    
    if (viewHistory.length === 0) return patterns
    
    // Calculate completion rate
    const completedViews = viewHistory.filter(item => item.view.isCompleted).length
    patterns.completionRate = Math.round((completedViews / viewHistory.length) * 100)
    
    // Determine preferred content type
    const videoViews = viewHistory.filter(item => item.video).length
    const shortViews = viewHistory.filter(item => item.short).length
    patterns.preferredContentType = videoViews > shortViews ? 'videos' : 'shorts'
    
    // Calculate peak watching hours
    const hourCount: { [key: number]: number } = {}
    viewHistory.forEach(item => {
      const hour = new Date(item.view.createdAt).getHours()
      hourCount[hour] = (hourCount[hour] || 0) + 1
    })
    
    patterns.peakWatchingHours = Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
    
    return patterns
  }

  // Calculate user engagement score
  private calculateUserEngagementScore(viewHistory: any[], videoShares: any[], shortShares: any[]): number {
    const totalViews = viewHistory.length
    const totalShares = videoShares.length + shortShares.length
    const completedViews = viewHistory.filter(item => item.view.isCompleted).length
    
    if (totalViews === 0) return 0
    
    // Engagement score based on views, completion rate, and sharing
    const completionScore = (completedViews / totalViews) * 50
    const sharingScore = Math.min(totalShares * 10, 30) // Max 30 points for sharing
    const activityScore = Math.min(totalViews * 2, 20) // Max 20 points for activity
    
    return Math.round(completionScore + sharingScore + activityScore)
  }

  // Get platform analytics
  async getPlatformAnalytics() {
    try {
      // This would typically aggregate data across all content
      // For now, return basic structure
      return {
        totalUsers: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        averageEngagementRate: 0,
        topCategories: [],
        trendingContent: []
      }
    } catch (error) {
      console.error('Error getting platform analytics:', error)
      return null
    }
  }
}

export const analyticsService = new AnalyticsService()