import { Router } from 'express'
import { userController } from '../controllers/userController'


const router = Router()

router.post('/register', async (req, res) => {
    await userController.createUser(req, res)
})

router.get('/:address', async (req, res) => {
    await userController.getUserByAddress(req, res)
})

router.post('/:address/balance', async (req, res) => {
    await userController.updateBalance(req, res)
})

export default router