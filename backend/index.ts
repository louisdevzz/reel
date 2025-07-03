import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import streamKeyRoutes from "./src/routes/streamKeyRoutes";
import streamSessionRoutes from "./src/routes/streamSessionRoutes";
import userRoutes from "./src/routes/userRoutes";
import videoRoutes from "./src/routes/videoRoutes";
import viewRoutes from "./src/routes/viewRoutes";
import commentRoutes from "./src/routes/commentRoutes";
import shareRoutes from "./src/routes/shareRoutes";
import analyticsRoutes from "./src/routes/analyticsRoutes";
import { streamSessionService } from "./src/services/streamSessionService";
import { websocketService } from "./src/services/websocketService";
import { streamKeyService } from "./src/services/streamKeyService";
import { redisService } from "./src/services/redisService";
import { workerService } from "./src/services/workerService";
import path from 'path';
// import chatRoutes from "./src/routes/chatRoutes"; // nếu có

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// Static files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/api/stream-keys', streamKeyRoutes);
app.use('/api/sessions', streamSessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/analytics', analyticsRoutes);
// app.use('/api/chat', chatRoutes); // nếu có

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocketClients: websocketService.getConnectedClientsCount()
  });
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis
    await redisService.connect();
    console.log('Redis Client Connected');
    
    // Initialize background workers
    await workerService.startWorkers();
    console.log('Starting background workers...');
    
    console.log('Background workers started');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`RTMP Server is running on rtmp://localhost:1935/live/`);
  console.log(`HLS Server is running on http://localhost:8000/live/`);
  
  await initializeServices();
});

// Initialize WebSocket service
websocketService.initialize(server);