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
import { streamSessionService } from "./src/services/streamSessionService";
import { WebSocketServer } from 'ws';
import http from 'http';
import { streamKeyService } from "./src/services/streamKeyService";
import { redisService } from "./src/services/redisService";
import { workerService } from "./src/services/workerService";
import path from 'path';
// import chatRoutes from "./src/routes/chatRoutes"; // nếu có

dotenv.config();

const app = express();
const server = http.createServer(app); // Tạo server HTTP để dùng chung với ws
const PORT = process.env.PORT || 3001;
const RTMP_PORT = 1935;
const HLS_PORT = 8000;

app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

app.use("/api/stream-keys", streamKeyRoutes);
app.use("/api/sessions", streamSessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/views", viewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/shares", shareRoutes);
// app.use("/api/chat", chatRoutes); // nếu có
app.use('/live', express.static(path.join(__dirname, 'media/live')));

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.get("/", (req, res) => {
  res.send("Streaming backend is running!");
});

// Client IP endpoint
app.get("/api/client-ip", (req, res) => {
  try {
    // Get client IP from various headers (for proxy/load balancer scenarios)
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    'unknown';
    
    // If x-forwarded-for contains multiple IPs, take the first one
    const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP;
    
    res.json({ 
      success: true, 
      ip: (ip || 'unknown').toString().replace(/^::ffff:/, '') // Remove IPv6 prefix if present
    });
  } catch (error) {
    console.error('Error getting client IP:', error);
    res.json({ 
      success: false, 
      ip: 'unknown' 
    });
  }
});

// WebSocket server cho trạng thái live
const wss = new WebSocketServer({ server, path: '/ws/stream-status' });

wss.on('connection', (ws: any, req: http.IncomingMessage) => {
  // Lấy streamKey từ query string
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const streamKey = url.searchParams.get('key');

  if (!streamKey) {
    ws.close();
    return;
  }

  // Hàm gửi trạng thái live
  const sendStatus = () => {
    const isLive = streamSessionService.isStreamLive(streamKey);
    console.log(`[WS] Check isLive for key=${streamKey}:`, isLive);
    ws.send(JSON.stringify({ isLive }));
  };

  // Gửi ngay khi kết nối
  sendStatus();

  // Gửi mỗi 2s
  const interval = setInterval(sendStatus, 2000);

  ws.on('close', () => {
    clearInterval(interval);
  });
});


// Thay app.listen bằng server.listen
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`RTMP Server is running on rtmp://localhost:${RTMP_PORT}/live/`);
  console.log(`HLS Server is running on http://localhost:${HLS_PORT}/live/`);
  
  // Initialize Redis connection
  const redisConnected = await redisService.ping();
  console.log(`Redis connection: ${redisConnected ? 'Connected' : 'Failed'}`);
  
  // Start background workers if Redis is connected
  if (redisConnected) {
    await workerService.startWorkers();
    console.log("Background workers started");
  }
  
  // Initialize sample stream keys
  streamKeyService.initializeSampleData();
  console.log("Sample stream keys initialized");
});