const API_BASE_URL = 'http://localhost:3001/api';

export interface StreamKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
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

  async getStreamKey(id: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>(`/stream-keys/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get stream key:', error);
      return null;
    }
  }

  async createStreamKey(name: string): Promise<StreamKey | null> {
    try {
      const response = await this.request<{ success: boolean; data: StreamKey }>('/stream-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
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
}

export const apiService = new ApiService(); 