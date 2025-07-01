import { Router } from 'express';
import { StreamKeyController } from '../controllers/streamKeyController';

const router = Router();
const streamKeyController = new StreamKeyController();

// GET /api/stream-keys - Get all stream keys
router.get('/', async (req, res) => {
  await streamKeyController.getAllStreamKeys(req, res);
});

// GET /api/stream-keys/:id - Get stream key by ID
router.get('/:id', async (req, res) => {
  await streamKeyController.getStreamKeyById(req, res);
});

// POST /api/stream-keys - Create new stream key
router.post('/', async (req, res) => {
  await streamKeyController.createStreamKey(req, res);
});

// PUT /api/stream-keys/:id - Update stream key
router.put('/:id', async (req, res) => {
  await streamKeyController.updateStreamKey(req, res);
});

// DELETE /api/stream-keys/:id - Delete stream key
router.delete('/:id', async (req, res) => {
  await streamKeyController.deleteStreamKey(req, res);
});

// POST /api/stream-keys/:id/activate - Activate stream key
router.post('/:id/activate', async (req, res) => {
  await streamKeyController.activateStreamKey(req, res);
});

// POST /api/stream-keys/:id/deactivate - Deactivate stream key
router.post('/:id/deactivate', async (req, res) => {
  await streamKeyController.deactivateStreamKey(req, res);
});

export default router; 