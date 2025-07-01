export interface StreamKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface StreamSession {
  id: string;
  streamKeyId: string;
  streamKey: string;
  status: 'idle' | 'live' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  duration: number;
  title?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface StreamStats {
  streamId: string;
  bitrate: number;
  fps: number;
  resolution: string;
  audioCodec: string;
  videoCodec: string;
}

export interface CreateStreamKeyRequest {
  name: string;
  description?: string;
}

export interface UpdateStreamKeyRequest {
  name?: string;
  isActive?: boolean;
  lastUsed?: Date;
} 