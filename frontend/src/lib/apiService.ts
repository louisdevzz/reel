const API_BASE_URL = 'http://localhost:3001/api';

export interface StreamKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  isLive?: boolean;
  createdAt: string;
  lastUsed?: string;
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

export interface User {
  id: string;
  rank: number;
  username: string;
  fullName: string;
  description: string;
  avatar: string;
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Stream Key APIs
  async getStreamKeys(): Promise<StreamKey[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey[] }>('/stream-keys');
      return response.data;
    } catch (error) {
      console.error('Failed to get stream keys:', error);
      return [];
    }
  }

  async getStreamKeyByUsername(username: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream key by username:', error);
      return null;
    }
  }

  async getStreamKeyByUserId(userId: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream key by user ID:', error);
      return null;
    }
  }

  async getStreamKey(id: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream key:', error);
      return null;
    }
  }

  async getStreamKeyByKey(key: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/key/${key}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream key by key:', error);
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
      console.error('Failed to create stream key:', error);
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
      console.error('Failed to update stream key:', error);
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
      console.error('Failed to delete stream key:', error);
      return false;
    }
  }

  async activateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${id}/activate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to activate stream key:', error);
      return null;
    }
  }

  async deactivateStreamKey(id: string): Promise<StreamKey | null> {
    try {
      return await this.request<StreamKey>(`/stream-keys/${id}/deactivate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to deactivate stream key:', error);
      return null;
    }
  }

  // Stream Session APIs
  async getSessions(): Promise<StreamSession[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession[] }>('/sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  async getActiveSessions(): Promise<StreamSession[]> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession[] }>('/sessions/active');
      return response.data;
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return [];
    }
  }

  async getLiveSessionByStreamKey(streamKey: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/sessions/live/${streamKey}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get live session by stream key:', error);
      return null;
    }
  }

  async getSession(id: string): Promise<StreamSession | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamSession }>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session:', error);
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
      console.error('Failed to create session:', error);
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
      console.error('Failed to start stream:', error);
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
      console.error('Failed to stop stream:', error);
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
      console.error('Failed to update session:', error);
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
      console.error('Failed to update viewer count:', error);
      return null;
    }
  }

  async getStreamStats(sessionId: string): Promise<StreamStats | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamStats }>(`/sessions/${sessionId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream stats:', error);
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
      console.error('Failed to update stream stats:', error);
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
      console.error('Failed to check user existence:', error)
      return { exists: false, user: null }
    }
  }

  async createUser(userData: {
    username: string
    fullName: string
    email: string
    description: string
    avatar?: string
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
      console.error('Failed to create user:', error)
      return null
    }
  }

  async getUserByAptosAddress(aptosAddress: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/address/${aptosAddress}`)
      return response.data
    } catch (error) {
      console.error('Failed to get user by Aptos address:', error)
      return null
    }
  }

  async getUserIdByAptosAddress(aptosAddress: string): Promise<string | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/address/${aptosAddress}`)
      return response.data.id
    } catch (error) {
      console.error('Failed to get user ID by Aptos address:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/users/username/${username}`)
      return response.data
    } catch (error) {
      console.error('Failed to get user by username:', error)
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
      console.error('Failed to update user:', error)
      return null
    }
  }

  async getTopUsersByFollowers(limit: number = 10): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/top?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Failed to get top users by followers:', error)
      return []
    }
  }

  async getCategories(): Promise<Array<{ name: string; subCategories: string[] }>> {
    try {
      const response = await this.request<{ success: boolean; data: Array<{ name: string; subCategories: string[] }> }>('/users/categories')
      return response.data
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  }

  // Search APIs
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Failed to search users:', error)
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
      console.error('Failed to get search suggestions:', error)
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
      console.error('Failed to search by category:', error)
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
      console.error('Failed to upload video:', error);
      
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
      console.error('Failed to get videos:', error);
      return [];
    }
  }

  async getShorts(): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>('/videos/shorts');
      return response.data;
    } catch (error) {
      console.error('Failed to get shorts:', error);
      return [];
    }
  }

  async getShortsWithPagination(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/paginated?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get shorts with pagination:', error);
      return [];
    }
  }

  async getShortsAroundVideo(videoId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/around/${videoId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get shorts around video:', error);
      return [];
    }
  }

  async getVideosByUser(userId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get videos by user:', error);
      return [];
    }
  }

  async getShortsByUser(userId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/videos/shorts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get shorts by user:', error);
      return [];
    }
  }

  async getShortById(id: string): Promise<any | null> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/videos/shorts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get short by id:', error);
      return null;
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
      console.error('Failed to track view:', error);
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
      console.error('Failed to update view:', error);
      return false;
    }
  }

  async getViewStats(contentId: string, contentType: 'videos' | 'shorts'): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/views/${contentType}/${contentId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get view stats:', error);
      return null;
    }
  }

  async getUserViewHistory(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/views/user/${userId}/history?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user view history:', error);
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
      console.error('Failed to add video like:', error);
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
      console.error('Failed to remove video like:', error);
      return false;
    }
  }

  async getUserVideoLikes(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/likes/videos?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user video likes:', error);
      return [];
    }
  }

  async isVideoLiked(userId: string, videoId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isLiked: boolean } }>(`/users/likes/videos/check?userId=${userId}&videoId=${videoId}`);
      return response.data.isLiked;
    } catch (error) {
      console.error('Failed to check if video is liked:', error);
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
      console.error('Failed to add short like:', error);
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
      console.error('Failed to remove short like:', error);
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async getUserShortLikes(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/likes/shorts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user short likes:', error);
      return [];
    }
  }

  async isShortLiked(userId: string, shortId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isLiked: boolean } }>(`/users/likes/shorts/check?userId=${userId}&shortId=${shortId}`);
      return response.data.isLiked;
    } catch (error) {
      console.error('Failed to check if short is liked:', error);
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
      console.error('Failed to add video comment:', error);
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
      console.error('Failed to remove video comment:', error);
      return false;
    }
  }

  async getVideoComments(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/comments/videos/${videoId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video comments:', error);
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
      console.error('Failed to update video comment:', error);
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
      console.error('Failed to add short comment:', error);
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
      console.error('Failed to remove short comment:', error);
      return false;
    }
  }

  async getShortComments(shortId: string): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/comments/shorts/${shortId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get short comments:', error);
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
      console.error('Failed to update short comment:', error);
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
      console.error('Failed to add video share:', error);
      return null;
    }
  }

  async getVideoShares(videoId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/videos/${videoId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video shares:', error);
      return [];
    }
  }

  async getVideoShareStats(videoId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/videos/${videoId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video share stats:', error);
      return null;
    }
  }

  async getUserVideoShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/user/${userId}/videos?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user video shares:', error);
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
      console.error('Failed to add short share:', error);
      return null;
    }
  }

  async getShortShares(shortId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/shorts/${shortId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get short shares:', error);
      return [];
    }
  }

  async getShortShareStats(shortId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/shares/shorts/${shortId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to get short share stats:', error);
      return null;
    }
  }

  async getUserShortShares(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/shares/user/${userId}/short?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user short shares:', error);
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
      console.error('Failed to add short bookmark:', error);
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
      console.error('Failed to remove short bookmark:', error);
      // Re-throw the error so the frontend can handle it properly
      throw error;
    }
  }

  async getUserShortBookmarks(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/users/${userId}/bookmarks/shorts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user short bookmarks:', error);
      return [];
    }
  }

  async isShortBookmarked(userId: string, shortId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isBookmarked: boolean } }>(`/users/bookmarks/shorts/check?userId=${userId}&shortId=${shortId}`);
      return response.data.isBookmarked;
    } catch (error) {
      console.error('Failed to check if short is bookmarked:', error);
      return false;
    }
  }

  // Analytics APIs
  async getContentAnalytics(contentId: string, contentType: 'videos' | 'shorts'): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/analytics/${contentType}/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get content analytics:', error);
      return null;
    }
  }

  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/analytics/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
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
      console.error('Error getting client IP from backend:', error);
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
      console.error(`Failed to track ${action}:`, error);
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
      console.error(`Failed to remove ${action}:`, error);
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
      console.error(`Failed to check ${action} status:`, error);
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
      console.error('Failed to follow user:', error)
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
      console.error('Failed to unfollow user:', error)
      // Re-throw the error so the frontend can handle it properly
      throw error
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean; data: { isFollowing: boolean } }>(`/users/follow/check?followerId=${followerId}&followingId=${followingId}`)
      return response.data.isFollowing
    } catch (error) {
      console.error('Failed to check if following:', error)
      return false
    }
  }

  async getFollowers(userId: string): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/${userId}/followers`)
      return response.data
    } catch (error) {
      console.error('Failed to get followers:', error)
      return []
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>(`/users/${userId}/following`)
      return response.data
    } catch (error) {
      console.error('Failed to get following:', error)
      return []
    }
  }

  async getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
    try {
      const response = await this.request<{ success: boolean; data: { followers: number; following: number } }>(`/users/${userId}/follow-stats`)
      return response.data
    } catch (error) {
      console.error('Failed to get follow stats:', error)
      return { followers: 0, following: 0 }
    }
  }
}

export const apiService = new ApiService(); 