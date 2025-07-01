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
}

export const apiService = new ApiService(); 