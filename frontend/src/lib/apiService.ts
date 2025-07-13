const API_BASE_URL = process.env.PUBLIC_API_URL+'/api' || 'http://localhost:3001/api';

// Helper function to handle errors silently or log only in development
const handleError = (error: any, context: string) => {
  // Only log errors in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]:`, error);
  }
  // In production, errors are handled silently
};

export interface StreamKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  isLive?: boolean;
  createdAt: string;
  lastUsed?: string;
  // Livepeer-specific fields
  livepeerStreamId?: string;
  playbackId?: string;
  playbackUrl?: string;
}

export interface StreamSession {
  id: string;
  streamKeyId: string;
  streamKey: string;
  status: 'idle' | 'live' | 'ended';
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  duration: number;
  title?: string;
  description?: string;
}

export interface StreamStats {
  streamId: string;
  bitrate: number;
  fps: number;
  resolution: string;
  audioCodec: string;
  videoCodec: string;
}

export interface Tip {
  id: string;
  tipperId: string;
  receiverId: string;
  amount: number;
  message?: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  tipType: 'general' | 'stream' | 'video' | 'short';
  streamSessionId?: string;
  videoId?: string;
  shortId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TipStats {
  totalTipsSent: number;
  totalTipsReceived: number;
  totalAmountSent: number;
  totalAmountReceived: number;
  averageTipSent: number;
  averageTipReceived: number;
}

export interface User {
  id: string;
  rank: number;
  username: string;
  fullName: string;
  description: string;
  balance: number;
  avatar: string;
  banner?: string;
  category: string;
  subCategory: string;
  email: string;
  aptosAddress: string;
  joinDate: Date;
  followers: number;
  following: number;
  videos: number;
  shorts: number;
  views: number;
  totalDonation: number;
  totalDonationCount: number;
  tags?: string[];
  social?: {
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    twitch?: string;
    instagram?: string;
    website?: string;
    discord?: string;
    telegram?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
    other?: string;
  }
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Silently throw error without logging to console
      throw error;
    }
  }

  // Stream Key APIs
  async getStreamKeys(): Promise<StreamKey[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey[] }>('/stream-keys');
      return response.data;
    } catch (error) {
      // Silently return empty array on error
      return [];
    }
  }

  async getStreamKeyByUsername(username: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/username/${username}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamKeyByUsername');
      return null;
    }
  }

  async getStreamKeyByUserId(userId: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/user/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamKeyByUserId');
      return null;
    }
  }

  async getStreamKey(id: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamKey');
      return null;
    }
  }

  async getStreamKeyByKey(key: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/key/${key}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamKeyByKey');
      return null;
    }
  }

  async createStreamKey(name: string, userId: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>('/stream-keys', {
        method: 'POST',
        body: JSON.stringify({ name, userId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createStreamKey');
      return null;
    }
  }

  async updateStreamKey(id: string, updates: Partial<StreamKey>): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateStreamKey');
      return null;
    }
  }

  async deleteStreamKey(id: string): Promise<boolean> {
    try {
      await this.request<void>(`/stream-keys/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      handleError(error, 'deleteStreamKey');
      return false;
    }
  }

  async activateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${id}/activate`, {
        method: 'POST',
      });
    } catch (error) {
      handleError(error, 'activateStreamKey');
      return null;
    }
  }

  async deactivateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${id}/deactivate`, {
        method: 'POST',
      });
    } catch (error) {
      handleError(error, 'deactivateStreamKey');
      return null;
    }
  }

  async regenerateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/${id}/regenerate`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      handleError(error, 'regenerateStreamKey');
      return null;
    }
  }

  // Livepeer Stream Status APIs
  async checkLivepeerStreamStatus(streamId: string): Promise<{ isActive: boolean; isLive: boolean } | null> {
    try {
      const response = await this.request<{ success: boolean; data: { isActive: boolean; isLive: boolean } }>(`/stream-keys/livepeer/status/${streamId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'checkLivepeerStreamStatus');
      return null;
    }
  }

  async getLivepeerStreamInfo(streamId: string): Promise<{
    streamId: string;
    playbackId: string;
    playbackUrl: string;
    isActive: boolean;
    isLive: boolean;
  } | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/stream-keys/livepeer/info/${streamId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLivepeerStreamInfo');
      return null;
    }
  }

  async getLivepeerStreamInfoByPlaybackId(playbackId: string): Promise<{
    streamId: string;
    playbackId: string;
    playbackUrl: string;
    isActive: boolean;
    isLive: boolean;
  } | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/stream-keys/livepeer/playback/${playbackId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLivepeerStreamInfoByPlaybackId');
      return null;
    }
  }

  async getStreamingInfo(id: string): Promise<{
    streamKey: string;
    rtmpUrl: string;
    webRtcUrl: string;
    playbackUrl?: string;
    streamId?: string;
    playbackId?: string;
    isActive: boolean;
    isLive?: boolean;
  } | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/stream-keys/${id}/streaming-info`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamingInfo');
      return null;
    }
  }

  async getStreamingInfoByUsername(username: string): Promise<{
    streamKey: string;
    rtmpUrl: string;
    webRtcUrl: string;
    playbackUrl?: string;
    streamId?: string;
    playbackId?: string;
    isActive: boolean;
    isLive?: boolean;
  } | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/stream-keys/username/${username}/streaming-info`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamingInfoByUsername');
      return null;
    }
  }



  // Stream Session APIs
  async getSessions(): Promise<StreamSession[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession[] }>('/sessions');
      return response.data;
    } catch (error) {
      handleError(error, 'getSessions');
      return [];
    }
  }

  async getActiveSessions(): Promise<StreamSession[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession[] }>('/sessions/active');
      return response.data;
    } catch (error) {
      handleError(error, 'getActiveSessions');
      return [];
    }
  }

  async getLiveSessionByStreamKey(streamKey: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/sessions/live/${streamKey}`);
      return response.data;
    } catch (error) {
      // 404 is expected when there's no live session - don't log as error
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      handleError(error, 'getLiveSessionByStreamKey');
      return null;
    }
  }

  async getSession(id: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getSession');
      return null;
    }
  }

  async createSession(streamKeyId: string, title?: string, description?: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>('/sessions', {
        method: 'POST',
        body: JSON.stringify({ streamKeyId, title, description }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createSession');
      return null;
    }
  }

  async startStream(sessionId: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      handleError(error, 'startStream');
      return null;
    }
  }

  async stopStream(sessionId: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      handleError(error, 'stopStream');
      return null;
    }
  }

  async updateSession(sessionId: string, title?: string, description?: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateSession');
      return null;
    }
  }

  async updateViewerCount(sessionId: string, viewerCount: number): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${sessionId}/viewer-count`, {
        method: 'PUT',
        body: JSON.stringify({ viewerCount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateViewerCount');
      return null;
    }
  }

  async getStreamStats(sessionId: string): Promise<StreamStats | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamStats }>(`/sessions/${sessionId}/stats`);
      return response.data;
    } catch (error) {
      handleError(error, 'getStreamStats');
      return null;
    }
  }

  async updateStreamStats(sessionId: string, stats: Partial<StreamStats>): Promise<StreamStats | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamStats }>(`/sessions/${sessionId}/stats`, {
        method: 'PUT',
        body: JSON.stringify(stats),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateStreamStats');
      return null;
    }
  }

  async getStreamStatus(streamKey: string) {
    const res = await fetch(`/sessions/status?key=${streamKey}`);
    if (!res.ok) throw new Error('Failed to fetch stream status');
    return res.json(); // { isLive: true/false }
  }

  // User APIs
  async checkUserExists(aptosAddress: string): Promise<{ exists: boolean; user: User | null }> {
    try {
      const response = await this.request<{ success: boolean; data: { exists: boolean; user: User | null } }>(`/users/check/${aptosAddress}`)
      return response.data
    } catch (error) {
      handleError(error, 'checkUserExists')
      return { exists: false, user: null }
    }
  }

  async createUser(userData: {
    username: string
    fullName: string
    email: string
    description: string
    avatar?: string
    banner?: string
    aptosAddress: string
    category?: string
    subCategory?: string
    tags?: string[]
    social?: {
      youtube?: string
      twitter?: string
      tiktok?: string
      twitch?: string
      instagram?: string
      website?: string
      discord?: string
      telegram?: string
      facebook?: string
      linkedin?: string
      github?: string
      other?: string
    }
  }): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      return response.data
    } catch (error) {
      handleError(error, 'createUser')
      return null
    }
  }

  async getUserByAptosAddress(aptosAddress: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/address/${aptosAddress}`)
      return response.data
    } catch (error) {
      handleError(error, 'getUserByAptosAddress')
      return null
    }
  }

  async getUserIdByAptosAddress(aptosAddress: string): Promise<string | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/address/${aptosAddress}`)
      return response.data.id
    } catch (error) {
      handleError(error, 'getUserIdByAptosAddress')
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/username/${username}`)
      return response.data
    } catch (error) {
      handleError(error, 'getUserByUsername')
      return null
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return response.data
    } catch (error) {
      handleError(error, 'updateUser')
      return null
    }
  }

  async getTopUsersByFollowers(limit: number = 10): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/top?limit=${limit}`)
      return response.data
    } catch (error) {
      handleError(error, 'getTopUsersByFollowers')
      return []
    }
  }

  async getCategories(): Promise<Array<{ name: string; subCategories: string[] }>> {
    try {
      const response = await this.request<{ success: boolean; data: Array<{ name: string; subCategories: string[] }> }>('/users/categories')
      return response.data
    } catch (error) {
      handleError(error, 'getCategories')
      return []
    }
  }

  // Search APIs
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      return response.data
    } catch (error) {
      handleError(error, 'searchUsers')
      return []
    }
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<{
    users: User[]
    categories: string[]
    subCategories: string[]
  }> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        data: {
          users: User[]
          categories: string[]
          subCategories: string[]
        }
      }>(`/users/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`)
      return response.data
    } catch (error) {
      handleError(error, 'getSearchSuggestions')
      return {
        users: [],
        categories: [],
        subCategories: []
      }
    }
  }

  async searchByCategory(category: string, subCategory?: string, limit: number = 20): Promise<User[]> {
    try {
      const params = new URLSearchParams({
        category: encodeURIComponent(category),
        limit: limit.toString()
      })
      if (subCategory) {
        params.append('subCategory', encodeURIComponent(subCategory))
      }
      
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/search/category?${params}`)
      return response.data
    } catch (error) {
      handleError(error, 'searchByCategory')
      return []
    }
  }

  // Video Upload APIs
  async uploadVideo(formData: FormData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const url = `${API_BASE_URL}/videos/upload/file`;
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800000); // 30 minutes timeout for large files
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      handleError(error, 'uploadVideo');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Upload timeout - file too large or slow connection'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  async getVideos(): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>('/videos');
      return response.data;
    } catch (error) {
      handleError(error, 'getVideos');
      return [];
    }
  }

  async getVideoById(id: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/videos/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getVideoById');
      return null;
    }
  }

  async getAllVideos(limit: number = 15): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos?limit=${limit}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllVideos');
      return [];
    }
  }

  async getShorts(): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>('/videos/shorts');
      return response.data;
    } catch (error) {
      handleError(error, 'getShorts');
      return [];
    }
  }

  async getShortsWithPagination(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/paginated?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortsWithPagination');
      return [];
    }
  }

  async getShortsAroundVideo(videoId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/around/${videoId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortsAroundVideo');
      return [];
    }
  }

  async getVideosByUser(userId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/user/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getVideosByUser');
      return [];
    }
  }

  async getShortsByUser(userId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/user/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortsByUser');
      return [];
    }
  }

  async getShortById(id: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/videos/shorts/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortById');
      return null;
    }
  }

  async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      await this.request<void>(`/videos/${videoId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'deleteVideo');
      return false;
    }
  }

  async deleteShort(shortId: string, userId: string): Promise<boolean> {
    try {
      await this.request<void>(`/videos/shorts/${shortId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'deleteShort');
      return false;
    }
  }

  // ===== ENGAGEMENT SYSTEM APIs =====

  // View Tracking APIs
  async trackView(contentId: string, contentType: 'videos' | 'shorts', userId?: string): Promise<{ viewId: string } | null> {
    try {
      const response = await this.request<{ success: boolean; data: { viewId: string } }>(`/views/${contentType}/${contentId}`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          sessionId: this.generateSessionId(),
          ipAddress: await this.getClientIP(),
          userAgent: navigator.userAgent,
        }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'trackView');
      return null;
    }
  }

  async updateView(viewId: string, watchDuration: number, isCompleted: boolean = false): Promise<boolean> {
    try {
      await this.request<void>(`/views/${viewId}`, {
        method: 'PUT',
        body: JSON.stringify({
          watchDuration,
          isCompleted,
        }),
      });
      return true;
    } catch (error) {
      handleError(error, 'updateView');
      return false;
    }
  }

  async getViewStats(contentId: string, contentType: 'videos' | 'shorts'): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/views/${contentType}/${contentId}/stats`);
      return response.data;
    } catch (error) {
      handleError(error, 'getViewStats');
      return null;
    }
  }

  async getUserViewHistory(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/views/user/${userId}/history?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserViewHistory');
      return [];
    }
  }

  // Like APIs
  async addVideoLike(userId: string, videoId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>('/users/likes/videos', {
        method: 'POST',
        body: JSON.stringify({ userId, videoId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addVideoLike');
      return null;
    }
  }

  async removeVideoLike(userId: string, videoId: string): Promise<boolean> {
    try {
      await this.request<void>('/users/likes/videos', {
        method: 'DELETE',
        body: JSON.stringify({ userId, videoId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'removeVideoLike');
      return false;
    }
  }

  async getUserVideoLikes(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/likes/videos?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserVideoLikes');
      return [];
    }
  }

  async isVideoLiked(userId: string, videoId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isLiked: boolean } }>(`/users/likes/videos/check?userId=${userId}&videoId=${videoId}`);
      return response.data.isLiked;
    } catch (error) {
      handleError(error, 'isVideoLiked');
      return false;
    }
  }

  async addShortLike(userId: string, shortId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>('/users/likes/shorts', {
        method: 'POST',
        body: JSON.stringify({ userId, shortId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addShortLike');
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async removeShortLike(userId: string, shortId: string): Promise<boolean> {
    try {
      await this.request<void>('/users/likes/shorts', {
        method: 'DELETE',
        body: JSON.stringify({ userId, shortId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'removeShortLike');
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async getUserShortLikes(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/likes/shorts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserShortLikes');
      return [];
    }
  }

  async isShortLiked(userId: string, shortId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isLiked: boolean } }>(`/users/likes/shorts/check?userId=${userId}&shortId=${shortId}`);
      return response.data.isLiked;
    } catch (error) {
      handleError(error, 'isShortLiked');
      return false;
    }
  }

  // Comment APIs
  async addVideoComment(videoId: string, userId: string, content: string, parentId?: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/comments/videos/${videoId}`, {
        method: 'POST',
        body: JSON.stringify({ userId, content, parentId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addVideoComment');
      return null;
    }
  }

  async removeVideoComment(commentId: string, userId: string): Promise<boolean> {
    try {
      await this.request<void>(`/comments/videos/${commentId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'removeVideoComment');
      return false;
    }
  }

  async getVideoComments(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/comments/videos/${videoId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getVideoComments');
      return [];
    }
  }

  async updateVideoComment(commentId: string, userId: string, content: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/comments/videos/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ userId, content }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateVideoComment');
      return null;
    }
  }

  async addShortComment(shortId: string, userId: string, content: string, parentId?: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/comments/shorts/${shortId}`, {
        method: 'POST',
        body: JSON.stringify({ userId, content, parentId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addShortComment');
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async removeShortComment(commentId: string, userId: string): Promise<boolean> {
    try {
      await this.request<void>(`/comments/shorts/${commentId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'removeShortComment');
      return false;
    }
  }

  async getShortComments(shortId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/comments/shorts/${shortId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortComments');
      return [];
    }
  }

  async updateShortComment(commentId: string, userId: string, content: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/comments/shorts/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ userId, content }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateShortComment');
      return null;
    }
  }

  // Share APIs
  async addVideoShare(videoId: string, userId: string, platform: string, shareUrl?: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/videos/${videoId}`, {
        method: 'POST',
        body: JSON.stringify({ userId, platform, shareUrl }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addVideoShare');
      return null;
    }
  }

  async getVideoShares(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/videos/${videoId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getVideoShares');
      return [];
    }
  }

  async getVideoShareStats(videoId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/videos/${videoId}/stats`);
      return response.data;
    } catch (error) {
      handleError(error, 'getVideoShareStats');
      return null;
    }
  }

  async getUserVideoShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/user/${userId}/videos?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserVideoShares');
      return [];
    }
  }

  async addShortShare(shortId: string, userId: string, platform: string, shareUrl?: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/shorts/${shortId}`, {
        method: 'POST',
        body: JSON.stringify({ userId, platform, shareUrl }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addShortShare');
      return null;
    }
  }

  async getShortShares(shortId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/shorts/${shortId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortShares');
      return [];
    }
  }

  async getShortShareStats(shortId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/shorts/${shortId}/stats`);
      return response.data;
    } catch (error) {
      handleError(error, 'getShortShareStats');
      return null;
    }
  }

  async getUserShortShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/user/${userId}/short?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserShortShares');
      return [];
    }
  }

  // Bookmark APIs (shorts only)
  async addShortBookmark(userId: string, shortId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>('/users/bookmarks/shorts', {
        method: 'POST',
        body: JSON.stringify({ userId, shortId }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'addShortBookmark');
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async removeShortBookmark(userId: string, shortId: string): Promise<boolean> {
    try {
      await this.request<void>('/users/bookmarks/shorts', {
        method: 'DELETE',
        body: JSON.stringify({ userId, shortId }),
      });
      return true;
    } catch (error) {
      handleError(error, 'removeShortBookmark');
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async getUserShortBookmarks(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/bookmarks/shorts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserShortBookmarks');
      return [];
    }
  }

  async isShortBookmarked(userId: string, shortId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isBookmarked: boolean } }>(`/users/bookmarks/shorts/check?userId=${userId}&shortId=${shortId}`);
      return response.data.isBookmarked;
    } catch (error) {
      handleError(error, 'isShortBookmarked');
      return false;
    }
  }

  // Analytics APIs
  async getContentAnalytics(contentId: string, contentType: 'videos' | 'shorts'): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/analytics/${contentType}/${contentId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getContentAnalytics');
      return null;
    }
  }

  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/analytics/user/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserAnalytics');
      return null;
    }
  }

  // Helper methods
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  private async getClientIP(): Promise<string> {
    try {
      // Try to get IP from our own backend first (which can proxy the request)
      const response = await fetch(`${API_BASE_URL}/client-ip`);
      if (response.ok) {
        const data = await response.json();
        return data.ip || 'unknown';
      }
    } catch (error) {
      handleError(error, 'getClientIP');
    }
    
    // Fallback: return unknown since we can't reliably get IP from frontend
    // due to CORS restrictions on external IP services
    return 'unknown';
  }

  // Engagement tracking convenience methods
  async trackEngagement(action: 'like' | 'comment' | 'share' | 'bookmark', contentId: string, contentType: 'videos' | 'shorts', userId: string, data?: any): Promise<any> {
    try {
      switch (action) {
        case 'like':
          if (contentType === 'videos') {
            return await this.addVideoLike(userId, contentId);
          } else {
            return await this.addShortLike(userId, contentId);
          }
        case 'comment':
          if (contentType === 'videos') {
            return await this.addVideoComment(contentId, userId, data.content, data.parentId);
          } else {
            return await this.addShortComment(contentId, userId, data.content, data.parentId);
          }
        case 'share':
          if (contentType === 'videos') {
            return await this.addVideoShare(contentId, userId, data.platform, data.shareUrl);
          } else {
            return await this.addShortShare(contentId, userId, data.platform, data.shareUrl);
          }
        case 'bookmark':
          if (contentType === 'shorts') {
            return await this.addShortBookmark(userId, contentId);
          } else {
            throw new Error('Bookmarks are only available for shorts');
          }
        default:
          throw new Error(`Unknown engagement action: ${action}`);
      }
    } catch (error) {
      handleError(error, `trackEngagement-${action}`);
      return null;
    }
  }

  async removeEngagement(action: 'like' | 'comment' | 'bookmark', contentId: string, contentType: 'videos' | 'shorts', userId: string, commentId?: string): Promise<boolean> {
    try {
      switch (action) {
        case 'like':
          if (contentType === 'videos') {
            return await this.removeVideoLike(userId, contentId);
          } else {
            return await this.removeShortLike(userId, contentId);
          }
        case 'comment':
          if (!commentId) throw new Error('Comment ID required for comment removal');
          if (contentType === 'videos') {
            return await this.removeVideoComment(commentId, userId);
          } else {
            return await this.removeShortComment(commentId, userId);
          }
        case 'bookmark':
          if (contentType === 'shorts') {
            return await this.removeShortBookmark(userId, contentId);
          } else {
            throw new Error('Bookmarks are only available for shorts');
          }
        default:
          throw new Error(`Unknown engagement action: ${action}`);
      }
    } catch (error) {
      handleError(error, `removeEngagement-${action}`);
      return false;
    }
  }

  async checkEngagementStatus(action: 'like' | 'bookmark', contentId: string, contentType: 'videos' | 'shorts', userId: string): Promise<boolean> {
    try {
      switch (action) {
        case 'like':
          if (contentType === 'videos') {
            return await this.isVideoLiked(userId, contentId);
          } else {
            return await this.isShortLiked(userId, contentId);
          }
        case 'bookmark':
          if (contentType === 'shorts') {
            return await this.isShortBookmarked(userId, contentId);
          } else {
            return false; // Bookmarks only for shorts
          }
        default:
          return false;
      }
    } catch (error) {
      handleError(error, `checkEngagementStatus-${action}`);
      return false;
    }
  }

  // Follow APIs
  async followUser(followerId: string, followingId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>('/users/follow', {
        method: 'POST',
        body: JSON.stringify({ followerId, followingId }),
      })
      return response.data
    } catch (error) {
      handleError(error, 'followUser')
      // Re-throw the error so the frontend can handle it properly
      throw error
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      await this.request<void>('/users/follow', {
        method: 'DELETE',
        body: JSON.stringify({ followerId, followingId }),
      })
      return true
    } catch (error) {
      handleError(error, 'unfollowUser')
      // Re-throw the error so the frontend can handle it properly
      throw error
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isFollowing: boolean } }>(`/users/follow/check?followerId=${followerId}&followingId=${followingId}`)
      return response.data.isFollowing
    } catch (error) {
      handleError(error, 'isFollowing')
      return false
    }
  }

  async getFollowers(userId: string): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/${userId}/followers`)
      return response.data
    } catch (error) {
      handleError(error, 'getFollowers')
      return []
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/${userId}/following`)
      return response.data
    } catch (error) {
      handleError(error, 'getFollowing')
      return []
    }
  }

  async getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
    try {
      const response = await this.request<{ success: boolean; data: { followers: number; following: number } }>(`/users/${userId}/follow-stats`)
      return response.data
    } catch (error) {
      handleError(error, 'getFollowStats')
      return { followers: 0, following: 0 }
    }
  }

  // Get user balance by Aptos address
  async getUserBalanceByAddress(aptosAddress: string): Promise<number | null> {
    try {
      const response = await this.request<{ success: boolean; data: { address: string; balance: number } }>(`/users/address/${aptosAddress}/balance`)
      return response.data.balance
    } catch (error) {
      handleError(error, 'getUserBalanceByAddress')
      return null
    }
  }

  // Chat APIs
  async clearChatMessages(streamKey: string): Promise<boolean> {
    try {
      await this.request<void>(`/chat/${streamKey}/messages`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      handleError(error, 'clearChatMessages');
      return false;
    }
  }

  // Add this method to fetch user by account (aptosAddress)
  async getUserByAccount(account: string): Promise<User | null> {
    // For now, treat account as aptosAddress
    return this.getUserByAptosAddress(account);
  }

  // ===== DEPOSIT TRANSACTION APIs =====

  // Get user's deposit transactions
  async getUserDepositTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/deposits/user/${userId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserDepositTransactions');
      return [];
    }
  }

  // Get user's deposit statistics
  async getUserDepositStats(userId: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/deposits/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserDepositStats');
      return null;
    }
  }

  // Get deposit transaction by ID
  async getDepositTransactionById(id: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/deposits/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getDepositTransactionById');
      return null;
    }
  }

  // Get deposit transaction by transaction hash
  async getDepositTransactionByTxHash(txHash: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/deposits/hash/${txHash}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getDepositTransactionByTxHash');
      return null;
    }
  }

  // Get all deposit transactions (admin only)
  async getAllDepositTransactions(limit: number = 20, offset: number = 0, status?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (status) {
        params.append('status', status);
      }
      
      const response = await this.request<{ success: boolean; data: any[] }>(`/deposits?${params}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllDepositTransactions');
      return [];
    }
  }

  // Get pending transactions (admin only)
  async getPendingTransactions(): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>('/deposits/pending/all');
      return response.data;
    } catch (error) {
      handleError(error, 'getPendingTransactions');
      return [];
    }
  }

  // ===== TIP APIs =====

  // Create a new tip
  async createTip(tipData: {
    tipperId: string;
    receiverId: string;
    amount: number;
    message?: string;
    tipType?: 'general' | 'stream' | 'video' | 'short';
    streamSessionId?: string;
    videoId?: string;
    shortId?: string;
    txHash?: string;
  }): Promise<Tip | null> {
    try {
      const response = await this.request<{ success: boolean; data: Tip }>('/tips', {
        method: 'POST',
        body: JSON.stringify(tipData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createTip');
      return null;
    }
  }

  // Get tip by ID
  async getTipById(id: string): Promise<Tip | null> {
    try {
      const response = await this.request<{ success: boolean; data: Tip }>(`/tips/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipById');
      return null;
    }
  }

  // Get tips sent by authenticated user
  async getTipsSentByUser(limit: number = 20, offset: number = 0): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/sent/me?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipsSentByUser');
      return [];
    }
  }

  // Get tips received by authenticated user
  async getTipsReceivedByUser(limit: number = 20, offset: number = 0): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/received/me?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipsReceivedByUser');
      return [];
    }
  }

  // Get user tip statistics
  async getUserTipStats(): Promise<TipStats | null> {
    try {
      const response = await this.request<{ success: boolean; data: TipStats }>('/tips/stats/me');
      return response.data;
    } catch (error) {
      handleError(error, 'getUserTipStats');
      return null;
    }
  }

  // Get tips for a specific stream session
  async getTipsForStreamSession(streamSessionId: string, limit: number = 50, offset: number = 0): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/stream/${streamSessionId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipsForStreamSession');
      return [];
    }
  }

  // Get tips for a specific video
  async getTipsForVideo(videoId: string, limit: number = 50, offset: number = 0): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/video/${videoId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipsForVideo');
      return [];
    }
  }

  // Get tips for a specific short
  async getTipsForShort(shortId: string, limit: number = 50, offset: number = 0): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/short/${shortId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipsForShort');
      return [];
    }
  }

  // Get recent tips (public)
  async getRecentTips(limit: number = 20): Promise<Tip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Tip[] }>(`/tips/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getRecentTips');
      return [];
    }
  }

  // Update tip status (admin/owner only)
  async updateTipStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<Tip | null> {
    try {
      const response = await this.request<{ success: boolean; data: Tip }>(`/tips/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateTipStatus');
      return null;
    }
  }

  // Update tip transaction hash (admin/owner only)
  async updateTipTxHash(id: string, txHash: string): Promise<Tip | null> {
    try {
      const response = await this.request<{ success: boolean; data: Tip }>(`/tips/${id}/txhash`, {
        method: 'PATCH',
        body: JSON.stringify({ txHash }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateTipTxHash');
      return null;
    }
  }

  // Confirm tip and update stats (admin/owner only)
  async confirmTipAndUpdateStats(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>(`/tips/${id}/confirm`, {
        method: 'POST',
      });
      return { success: response.success };
    } catch (error) {
      handleError(error, 'confirmTipAndUpdateStats');
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to confirm tip' };
    }
  }

  // Delete tip (admin only)
  async deleteTip(id: string): Promise<boolean> {
    try {
      await this.request<void>(`/tips/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      handleError(error, 'deleteTip');
      return false;
    }
  }

  // Convenience method to get tips by content type
  async getTipsByContent(contentId: string, contentType: 'stream' | 'video' | 'short', limit: number = 50, offset: number = 0): Promise<Tip[]> {
    try {
      switch (contentType) {
        case 'stream':
          return await this.getTipsForStreamSession(contentId, limit, offset);
        case 'video':
          return await this.getTipsForVideo(contentId, limit, offset);
        case 'short':
          return await this.getTipsForShort(contentId, limit, offset);
        default:
          return [];
      }
    } catch (error) {
      handleError(error, 'getTipsByContent');
      return [];
    }
  }

  // Convenience method to send tip to user
  async sendTipToUser(tipperId: string, receiverId: string, amount: number, message?: string, tipType: 'general' | 'stream' | 'video' | 'short' = 'general', contentId?: string): Promise<Tip | null> {
    try {
      const tipData: any = {
        tipperId,
        receiverId,
        amount,
        message,
        tipType,
      };

      // Add content-specific ID based on tip type
      if (contentId) {
        switch (tipType) {
          case 'stream':
            tipData.streamSessionId = contentId;
            break;
          case 'video':
            tipData.videoId = contentId;
            break;
          case 'short':
            tipData.shortId = contentId;
            break;
        }
      }

      return await this.createTip(tipData);
    } catch (error) {
      handleError(error, 'sendTipToUser');
      return null;
    }
  }
}

export const apiService = new ApiService(); 