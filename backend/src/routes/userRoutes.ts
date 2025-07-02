import { Router } from 'express'
import { UserController } from '../controllers/userController'
import { categories } from '../lib'

const router = Router()
const userController = new UserController()

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  await userController.getAllUsers(req, res)
})

// GET /api/users/categories - Get all categories and subcategories
router.get('/categories', async (req, res) => {
  res.json({
    success: true,
    data: categories,
  })
})

// GET /api/users/top - Get top users by followers (must come before /:id)
router.get('/top', async (req, res) => {
  await userController.getTopUsersByFollowers(req, res)
})

// GET /api/users/address/:address - Get user by Aptos address
router.get('/address/:address', async (req, res) => {
  await userController.getUserByAptosAddress(req, res)
})

// GET /api/users/username/:username - Get user by username
router.get('/username/:username', async (req, res) => {
  await userController.getUserByUsername(req, res)
})

// GET /api/users/check/:address - Check if user exists by Aptos address
router.get('/check/:address', async (req, res) => {
  await userController.checkUserExists(req, res)
})

// GET /api/users/search - Search users by query
router.get('/search', async (req, res) => {
  await userController.searchUsers(req, res)
})

// GET /api/users/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  await userController.getSearchSuggestions(req, res)
})

// GET /api/users/search/category - Search users by category
router.get('/search/category', async (req, res) => {
  await userController.searchByCategory(req, res)
})

// GET /api/users/:id - Get user by ID (must come after specific routes)
router.get('/:id', async (req, res) => {
  await userController.getUserById(req, res)
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  await userController.createUser(req, res)
})

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  await userController.updateUser(req, res)
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  await userController.deleteUser(req, res)
})

export default router 