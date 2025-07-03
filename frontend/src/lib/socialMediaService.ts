// Social Media API Service for fetching subscriber/follower counts
// Note: These APIs require proper authentication and API keys for production use

interface SocialMediaStats {
  platform: string;
  followers: number;
  subscribers?: number;
  error?: string;
}

interface YouTubeChannelInfo {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

interface TwitterUserInfo {
  followers_count: number;
  friends_count: number;
  statuses_count: number;
}

interface TikTokUserInfo {
  followerCount: number;
  followingCount: number;
  videoCount: number;
}

interface TwitchUserInfo {
  followers: number;
  views: number;
}

export class SocialMediaService {
  // YouTube API - requires API key
  static async getYouTubeStats(channelId: string, apiKey?: string): Promise<SocialMediaStats> {
    try {
      if (!apiKey) {
        return {
          platform: 'youtube',
          followers: 0,
          error: 'YouTube API key required'
        };
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const stats = data.items[0].statistics;
        return {
          platform: 'youtube',
          followers: parseInt(stats.subscriberCount) || 0,
          subscribers: parseInt(stats.subscriberCount) || 0
        };
      }

      return {
        platform: 'youtube',
        followers: 0,
        error: 'Channel not found'
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      return {
        platform: 'youtube',
        followers: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Extract YouTube channel ID from username or URL
  static extractYouTubeChannelId(usernameOrUrl: string): string {
    // Handle different YouTube URL formats
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = usernameOrUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }
    // If it's just a username, return as is (might need conversion)
    return usernameOrUrl;
  }

  static async getChannelIdFromHandle(username: string, apiKey: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent('@' + username)}&key=${apiKey}`
      );
  
      if (!response.ok) throw new Error('Failed to fetch channel');
  
      const data = await response.json();
  
      if (data.items && data.items.length > 0) {
        return data.items[0].snippet.channelId; // 👈 đây là channelId
      }
  
      return null;
    } catch (err) {
      console.error('Error fetching channel ID:', err);
      return null;
    }
  }

  // Twitter API - requires Bearer token
  static async getTwitterStats(username: string, bearerToken?: string): Promise<SocialMediaStats> {
    try {
      if (!bearerToken) {
        return {
          platform: 'twitter',
          followers: 0,
          error: 'Twitter Bearer token required'
        };
      }

      const response = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`,
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.public_metrics) {
        return {
          platform: 'twitter',
          followers: data.data.public_metrics.followers_count || 0
        };
      }

      return {
        platform: 'twitter',
        followers: 0,
        error: 'User not found'
      };
    } catch (error) {
      console.error('Twitter API error:', error);
      return {
        platform: 'twitter',
        followers: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // TikTok API - requires RapidAPI key
  static async getTikTokStats(username: string, rapidApiKey?: string): Promise<SocialMediaStats> {
    try {
      if (!rapidApiKey) {
        return {
          platform: 'tiktok',
          followers: 0,
          error: 'RapidAPI key required for TikTok'
        };
      }

      const response = await fetch(
        `https://tiktok-video-no-watermark2.p.rapidapi.com/user/info?unique_id=${username}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.stats) {
        return {
          platform: 'tiktok',
          followers: data.data.stats.follower_count || 0
        };
      }

      return {
        platform: 'tiktok',
        followers: 0,
        error: 'User not found'
      };
    } catch (error) {
      console.error('TikTok API error:', error);
      return {
        platform: 'tiktok',
        followers: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Twitch API - requires Client ID and OAuth token
  static async getTwitchStats(username: string, clientId?: string, oauthToken?: string): Promise<SocialMediaStats> {
    try {
      if (!clientId || !oauthToken) {
        return {
          platform: 'twitch',
          followers: 0,
          error: 'Twitch Client ID and OAuth token required'
        };
      }

      // First get user ID
      const userResponse = await fetch(
        `https://api.twitch.tv/helix/users?login=${username}`,
        {
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${oauthToken}`
          }
        }
      );

      if (!userResponse.ok) {
        throw new Error(`Twitch API error: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      
      if (!userData.data || userData.data.length === 0) {
        return {
          platform: 'twitch',
          followers: 0,
          error: 'User not found'
        };
      }

      const userId = userData.data[0].id;

      // Then get followers count
      const followersResponse = await fetch(
        `https://api.twitch.tv/helix/users/follows?to_id=${userId}`,
        {
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${oauthToken}`
          }
        }
      );

      if (!followersResponse.ok) {
        throw new Error(`Twitch followers API error: ${followersResponse.status}`);
      }

      const followersData = await followersResponse.json();
      
      return {
        platform: 'twitch',
        followers: followersData.total || 0
      };
    } catch (error) {
      console.error('Twitch API error:', error);
      return {
        platform: 'twitch',
        followers: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get all social media stats for a user
  static async getAllSocialMediaStats(
    socialData: {
      youtube?: string;
      twitter?: string;
      tiktok?: string;
      twitch?: string;
    },
    apiKeys: {
      youtubeApiKey?: string;
      twitterBearerToken?: string;
      tiktokRapidApiKey?: string;
      twitchClientId?: string;
      twitchOAuthToken?: string;
    }
  ): Promise<SocialMediaStats[]> {
    const promises: Promise<SocialMediaStats>[] = [];

    if (socialData.youtube) {
      const username = this.extractYouTubeChannelId(socialData.youtube);
      const channelId = await this.getChannelIdFromHandle(username, apiKeys.youtubeApiKey || '');
      if (channelId) {
        promises.push(this.getYouTubeStats(channelId, apiKeys.youtubeApiKey));
      }
    }

    if (socialData.twitter) {
      promises.push(this.getTwitterStats(socialData.twitter, apiKeys.twitterBearerToken));
    }

    if (socialData.tiktok) {
      promises.push(this.getTikTokStats(socialData.tiktok, apiKeys.tiktokRapidApiKey));
    }

    if (socialData.twitch) {
      promises.push(this.getTwitchStats(socialData.twitch, apiKeys.twitchClientId, apiKeys.twitchOAuthToken));
    }

    try {
      const results = await Promise.allSettled(promises);
      return results.map(result => 
        result.status === 'fulfilled' ? result.value : {
          platform: 'unknown',
          followers: 0,
          error: 'Request failed'
        }
      );
    } catch (error) {
      console.error('Error fetching social media stats:', error);
      return [];
    }
  }

  // Mock function for development/testing (returns fake data)
  static getMockSocialMediaStats(): SocialMediaStats[] {
    return [
      {
        platform: 'youtube',
        followers: 0,
        subscribers: 0
      },
      {
        platform: 'twitter',
        followers: 0
      },
      {
        platform: 'tiktok',
        followers: 0
      },
      {
        platform: 'twitch',
        followers: 0
      }
    ];
  }
}

// Helper function to format follower counts
export const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Helper function to get platform display name
export const getPlatformDisplayName = (platform: string): string => {
  const names: { [key: string]: string } = {
    youtube: 'YouTube',
    twitter: 'Twitter',
    tiktok: 'TikTok',
    twitch: 'Twitch'
  };
  return names[platform] || platform;
}; 