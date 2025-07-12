import { Router } from 'express';
import { withdrawController } from '../controllers/withdrawController';

const router = Router();

// POST /withdraw - Withdraw REEL tokens to user address
router.post('/', async (req, res) => {
    await withdrawController.withdrawToUser(req, res);
});

export default router; 