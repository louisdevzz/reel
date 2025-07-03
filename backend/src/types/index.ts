export interface StreamKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  isLive?: boolean;
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

export interface Video {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  type: 'video' | 'short'; // video: > 60s, short: <= 60s
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: number;
  uploadDate: Date;
  userId: string;
  tags?: string[];
  isPublic: boolean;
}

export interface Short {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds, must be <= 60
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: number;
  uploadDate: Date;
  userId: string;
  tags?: string[];
  isPublic: boolean;
}

// Re-export User type from Drizzle schema
export type { User } from '../../db/schema'

// Extended Request interface for authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    aptosAddress: string;
  };
}