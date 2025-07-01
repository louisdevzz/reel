import { Router } from 'express';
import { StreamSessionController } from '../controllers/streamSessionController';

const router = Router();
const streamSessionController = new StreamSessionController();

// GET /api/sessions - Get all sessions
router.get('/', async (req, res) => {
  await streamSessionController.getAllSessions(req, res);
});

// GET /api/sessions/active - Get active sessions
router.get('/active', async (req, res) => {
  await streamSessionController.getActiveSessions(req, res);
});

// GET /api/sessions/:id - Get session by ID
router.get('/:id', async (req, res) => {
  await streamSessionController.getSessionById(req, res);
});

// POST /api/sessions - Create new session
router.post('/', async (req, res) => {
  await streamSessionController.createSession(req, res);
});

// POST /api/sessions/:id/start - Start stream
router.post('/:id/start', async (req, res) => {
  await streamSessionController.startStream(req, res);
});

// POST /api/sessions/:id/stop - Stop stream
router.post('/:id/stop', async (req, res) => {
  await streamSessionController.stopStream(req, res);
});

// PUT /api/sessions/:id/viewer-count - Update viewer count
router.put('/:id/viewer-count', async (req, res) => {
  await streamSessionController.updateViewerCount(req, res);
});

// GET /api/sessions/:id/stats - Get stream stats
router.get('/:id/stats', async (req, res) => {
  await streamSessionController.getStreamStats(req, res);
});

// PUT /api/sessions/:id/stats - Update stream stats
router.put('/:id/stats', async (req, res) => {
  await streamSessionController.updateStreamStats(req, res);
});

// GET /api/sessions/status - Get stream status by stream key
router.get('/status', async (req, res) => {
  await streamSessionController.getStreamStatusByKey(req, res);
});

export default router;