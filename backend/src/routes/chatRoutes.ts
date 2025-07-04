import { Router } from 'express';
import { chatController } from '../controllers/chatController';

const router = Router();

// Get recent messages for a stream
router.get('/:streamKey/messages', async (req, res) => {
  await chatController.getMessages(req, res);
});

// Get message count for a stream
router.get('/:streamKey/count', async (req, res) => {
  await chatController.getMessageCount(req, res);
});

// Get chat participants for a stream
router.get('/:streamKey/participants', async (req, res) => {
  await chatController.getParticipants(req, res);
});

// Clear messages for a stream (admin only)
router.delete('/:streamKey/messages', async (req, res) => {
  await chatController.clearMessages(req, res);
});

// Get active chat rooms
router.get('/rooms/active', async (req, res) => {
  await chatController.getActiveChatRooms(req, res);
});

export default router; 