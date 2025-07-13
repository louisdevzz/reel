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

router.post('/update-info', async (req, res) => {
    await userController.updateUserInfo(req, res)
})

router.post('/:address/update-followers', async (req, res) => {
    await userController.updateFollowers(req, res)
})

router.post('/:address/update-following', async (req, res) => {
    await userController.updateFollowing(req, res)
})

export default router