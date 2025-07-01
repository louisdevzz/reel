import { v4 as uuidv4 } from 'uuid';
import type { StreamSession, StreamStats } from '../types';

class StreamSessionService {
  private sessions: Map<string, StreamSession> = new Map();
  private stats: Map<string, StreamStats> = new Map();

  createSession(streamKeyId: string, streamKey: string, title?: string, description?: string): StreamSession {
    const id = uuidv4();
    
    const session: StreamSession = {
      id,
      streamKeyId,
      streamKey,
      status: 'idle',
      viewerCount: 0,
      duration: 0,
      title,
      description,
    };

    this.sessions.set(id, session);
    return session;
  }

  getSessionById(id: string): StreamSession | undefined {
    return this.sessions.get(id);
  }

  getSessionByStreamKey(streamKey: string): StreamSession | undefined {
    return Array.from(this.sessions.values()).find(session => session.streamKey === streamKey);
  }

  getActiveSessions(): StreamSession[] {
    return Array.from(this.sessions.values()).filter(session => session.status === 'live');
  }

  startStream(sessionId: string): StreamSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.status = 'live';
    session.startedAt = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  stopStream(sessionId: string): StreamSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.status = 'ended';
    session.endedAt = new Date();
    if (session.startedAt) {
      session.duration = Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    this.sessions.set(sessionId, session);
    return session;
  }

  updateViewerCount(sessionId: string, count: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.viewerCount = count;
    this.sessions.set(sessionId, session);
    return true;
  }

  updateStreamStats(sessionId: string, stats: Omit<StreamStats, 'streamId'>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.stats.set(sessionId, {
      streamId: sessionId,
      ...stats,
    });
    return true;
  }

  getStreamStats(sessionId: string): StreamStats | undefined {
    return this.stats.get(sessionId);
  }

  getAllSessions(): StreamSession[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): boolean {
    this.stats.delete(sessionId);
    return this.sessions.delete(sessionId);
  }

  isStreamLive(streamKey: string): boolean {
    const session = this.getSessionByStreamKey(streamKey);
    return !!session && session.status === 'live';
  }
}

export const streamSessionService = new StreamSessionService(); 