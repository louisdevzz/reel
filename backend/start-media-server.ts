import { streamKeyService } from './src/services/streamKeyService';
import { streamSessionService } from './src/services/streamSessionService';
import { websocketService } from './src/services/websocketService';
import { Livepeer } from 'livepeer';
import dotenv from 'dotenv';

dotenv.config();

console.log('[LivepeerService] Starting Livepeer integration service...');

// Initialize Livepeer client
const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_API_KEY || '',
});

// Polling interval to check stream status (in milliseconds)
const POLLING_INTERVAL = 10000; // 10 seconds

// Store active streams and their polling intervals
const activeStreams = new Map<string, NodeJS.Timeout>();

// Function to check stream status from Livepeer
async function checkStreamStatus(streamKey: string) {
  try {
    const streamKeyData = await streamKeyService.getStreamKeyByKey(streamKey);
    if (!streamKeyData?.livepeerStreamId) {
      console.log(`[LivepeerService] No Livepeer stream ID found for key: ${streamKey}`);
      return;
    }

    const streamStatus = await livepeer.stream.get(streamKeyData.livepeerStreamId);
    const stream = streamStatus.stream;

    if (stream) {
      const isLive = stream.isActive || false;
      
      // Update local database status
      await streamSessionService.updateStreamKeyLiveStatus(streamKey, isLive);
      
      // If stream is no longer live, stop polling and clean up
      if (!isLive) {
        const pollingInterval = activeStreams.get(streamKey);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          activeStreams.delete(streamKey);
        }
        
        // Stop the current live session if exists
        const liveSession = await streamSessionService.getLiveSessionByStreamKey(streamKey);
        if (liveSession && liveSession.stream_sessions && liveSession.stream_sessions.id) {
          await streamSessionService.stopSession(liveSession.stream_sessions.id);
          console.log(`[LivepeerService] Stopped live session for stream key: ${streamKey}`);
        } else if (liveSession && liveSession.id) {
          await streamSessionService.stopSession(liveSession.id);
          console.log(`[LivepeerService] Stopped live session for stream key: ${streamKey}`);
        }
      }
      
      // Broadcast status update to WebSocket clients
      await websocketService.broadcastStatusUpdate(streamKey);
      
      console.log(`[LivepeerService] Stream status updated for key: ${streamKey}, isLive: ${isLive}`);
    }
  } catch (error) {
    console.error(`[LivepeerService] Error checking stream status for ${streamKey}:`, error);
  }
}

// Function to start monitoring a stream
function startStreamMonitoring(streamKey: string) {
  // Stop existing monitoring if any
  const existingInterval = activeStreams.get(streamKey);
  if (existingInterval) {
    clearInterval(existingInterval);
  }
  
  // Start new monitoring
  const interval = setInterval(() => checkStreamStatus(streamKey), POLLING_INTERVAL);
  activeStreams.set(streamKey, interval);
  
  console.log(`[LivepeerService] Started monitoring stream: ${streamKey}`);
}

// Function to stop monitoring a stream
function stopStreamMonitoring(streamKey: string) {
  const interval = activeStreams.get(streamKey);
  if (interval) {
    clearInterval(interval);
    activeStreams.delete(streamKey);
    console.log(`[LivepeerService] Stopped monitoring stream: ${streamKey}`);
  }
}

// Initialize monitoring for existing active streams
async function initializeActiveStreams() {
  try {
    const activeStreamKeys = await streamKeyService.getAllStreamKeys();
    for (const streamKey of activeStreamKeys) {
      if (streamKey.isLive) {
        startStreamMonitoring(streamKey.key);
      }
    }
    console.log(`[LivepeerService] Initialized monitoring for ${activeStreamKeys.filter(sk => sk.isLive).length} active streams`);
  } catch (error) {
    console.error('[LivepeerService] Error initializing active streams:', error);
  }
}

// Start the service
async function startLivepeerService() {
  try {
    // Initialize monitoring for existing active streams
    await initializeActiveStreams();
    
    console.log(`🚀 Livepeer Service is running and monitoring streams`);
    console.log(`📡 RTMP URL: rtmp://rtmp.livepeer.com/live`);
    console.log(`🌐 WebRTC URL: https://playback.livepeer.studio/webrtc/{streamKey}`);
    
    // Keep the process running
    setInterval(() => {
      // Heartbeat to keep the service alive
      console.log(`[LivepeerService] Service heartbeat - monitoring ${activeStreams.size} streams`);
    }, 60000); // Every minute
    
  } catch (error) {
    console.error('[LivepeerService] Error starting service:', error);
    process.exit(1);
  }
}

// Export functions for external use
export { startStreamMonitoring, stopStreamMonitoring, checkStreamStatus };

// Start the service if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startLivepeerService();
}
