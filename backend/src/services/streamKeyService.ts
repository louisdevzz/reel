import { v4 as uuidv4 } from 'uuid';
import type { StreamKey, CreateStreamKeyRequest, UpdateStreamKeyRequest } from '../types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../stream-keys.json');

function serializeStreamKey(sk: StreamKey): any {
  return {
    ...sk,
    createdAt: sk.createdAt instanceof Date ? sk.createdAt.toISOString() : sk.createdAt,
    lastUsed: sk.lastUsed instanceof Date ? sk.lastUsed.toISOString() : sk.lastUsed,
  };
}

function deserializeStreamKey(obj: any): StreamKey {
  return {
    ...obj,
    createdAt: obj.createdAt ? new Date(obj.createdAt) : new Date(),
    lastUsed: obj.lastUsed ? new Date(obj.lastUsed) : undefined,
  };
}

function readAllKeysFromFile(): StreamKey[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(deserializeStreamKey) : [];
  } catch {
    return [];
  }
}

function writeAllKeysToFile(keys: StreamKey[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(keys.map(serializeStreamKey), null, 2), 'utf-8');
}

class StreamKeyService {
  private streamKeys: Map<string, StreamKey> = new Map();

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    const keys = readAllKeysFromFile();
    this.streamKeys = new Map(keys.map(sk => [sk.id, sk]));
  }

  private saveToFile() {
    writeAllKeysToFile(Array.from(this.streamKeys.values()));
  }

  generateStreamKey(): string {
    // Generate a random stream key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createStreamKey(data: CreateStreamKeyRequest): StreamKey {
    const id = uuidv4();
    const key = this.generateStreamKey();
    
    const streamKey: StreamKey = {
      id,
      key,
      name: data.name,
      isActive: true,
      createdAt: new Date(),
    };

    this.streamKeys.set(id, streamKey);
    this.saveToFile();
    return streamKey;
  }

  getAllStreamKeys(): StreamKey[] {
    this.loadFromFile();
    return Array.from(this.streamKeys.values());
  }

  getStreamKeyById(id: string): StreamKey | undefined {
    this.loadFromFile();
    return this.streamKeys.get(id);
  }

  getStreamKeyByKey(key: string): StreamKey | undefined {
    this.loadFromFile();
    
    // Handle null/undefined keys
    if (!key) {
      console.log(`❌ Stream key is null/undefined/empty`);
      return undefined;
    }
    
    const trimmedKey = key.trim();
    console.log(`🔍 Looking for stream key: "${key}" (trimmed: "${trimmedKey}")`);
    
    const found = Array.from(this.streamKeys.values()).find(sk => sk.key.trim() === trimmedKey);
    
    if (found) {
      console.log(`✅ Found stream key: ${found.name} (${found.key}) - Active: ${found.isActive}`);
    } else {
      console.log(`❌ Stream key not found: "${trimmedKey}"`);
      console.log(`📋 Available keys:`, Array.from(this.streamKeys.values()).map(sk => ({
        name: sk.name,
        key: sk.key,
        isActive: sk.isActive
      })));
    }
    
    return found;
  }

  updateStreamKey(id: string, data: UpdateStreamKeyRequest): StreamKey | null {
    this.loadFromFile();
    const streamKey = this.streamKeys.get(id);
    if (!streamKey) {
      return null;
    }

    const updatedStreamKey: StreamKey = {
      ...streamKey,
      ...data,
    };

    this.streamKeys.set(id, updatedStreamKey);
    this.saveToFile();
    return updatedStreamKey;
  }

  deleteStreamKey(id: string): boolean {
    this.loadFromFile();
    const result = this.streamKeys.delete(id);
    this.saveToFile();
    return result;
  }

  activateStreamKey(id: string): StreamKey | null {
    return this.updateStreamKey(id, { isActive: true });
  }

  deactivateStreamKey(id: string): StreamKey | null {
    return this.updateStreamKey(id, { isActive: false });
  }

  // Initialize with some sample stream keys (only if file is empty)
  initializeSampleData() {
    this.loadFromFile();
    if (this.streamKeys.size > 0) return;
  }
}

export const streamKeyService = new StreamKeyService(); 