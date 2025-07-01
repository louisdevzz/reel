import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import streamKeyRoutes from "./src/routes/streamKeyRoutes";
import streamSessionRoutes from "./src/routes/streamSessionRoutes";
import { streamSessionService } from "./src/services/streamSessionService";
import { WebSocketServer } from 'ws';
import http from 'http';
import { streamKeyService } from "./src/services/streamKeyService";
import path from 'path';
// import chatRoutes from "./src/routes/chatRoutes"; // nếu có

dotenv.config();

const app = express();
const server = http.createServer(app); // Tạo server HTTP để dùng chung với ws
const PORT = process.env.PORT || 3001;
const RTMP_PORT = 1935;
const HLS_PORT = 8000;

app.use(cors());
app.use(express.json());

app.use("/api/stream-keys", streamKeyRoutes);
app.use("/api/sessions", streamSessionRoutes);
// app.use("/api/chat", chatRoutes); // nếu có
app.use('/live', express.static(path.join(__dirname, 'media/live')));

app.get("/", (req, res) => {
  res.send("Streaming backend is running!");
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
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`RTMP Server is running on rtmp://localhost:${RTMP_PORT}/live/`);
  console.log(`HLS Server is running on http://localhost:${HLS_PORT}/live/`);
  
  // Initialize sample stream keys
  streamKeyService.initializeSampleData();
  console.log("Sample stream keys initialized");
});