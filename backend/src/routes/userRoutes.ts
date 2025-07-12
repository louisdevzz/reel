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

// Bookmark routes (shorts only)
// POST /api/users/bookmarks/shorts - Add short bookmark
router.post('/bookmarks/shorts', async (req, res) => {
  await userController.addShortBookmark(req, res)
})

// DELETE /api/users/bookmarks/shorts - Remove short bookmark
router.delete('/bookmarks/shorts', async (req, res) => {
  await userController.removeShortBookmark(req, res)
})

// GET /api/users/:userId/bookmarks/shorts - Get user's short bookmarks
router.get('/:userId/bookmarks/shorts', async (req, res) => {
  await userController.getUserShortBookmarks(req, res)
})

// GET /api/users/bookmarks/shorts/check - Check if short is bookmarked
router.get('/bookmarks/shorts/check', async (req, res) => {
  await userController.isShortBookmarked(req, res)
})

// Like routes for videos
// POST /api/users/likes/videos - Add video like
router.post('/likes/videos', async (req, res) => {
  await userController.addVideoLike(req, res)
})

// DELETE /api/users/likes/videos - Remove video like
router.delete('/likes/videos', async (req, res) => {
  await userController.removeVideoLike(req, res)
})

// GET /api/users/:userId/likes/videos - Get user's video likes
router.get('/:userId/likes/videos', async (req, res) => {
  await userController.getUserVideoLikes(req, res)
})

// GET /api/users/likes/videos/check - Check if video is liked
router.get('/likes/videos/check', async (req, res) => {
  await userController.isVideoLiked(req, res)
})

// Like routes for shorts
// POST /api/users/likes/shorts - Add short like
router.post('/likes/shorts', async (req, res) => {
  await userController.addShortLike(req, res)
})

// DELETE /api/users/likes/shorts - Remove short like
router.delete('/likes/shorts', async (req, res) => {
  await userController.removeShortLike(req, res)
})

// GET /api/users/:userId/likes/shorts - Get user's short likes
router.get('/:userId/likes/shorts', async (req, res) => {
  await userController.getUserShortLikes(req, res)
})

// GET /api/users/likes/shorts/check - Check if short is liked
router.get('/likes/shorts/check', async (req, res) => {
  await userController.isShortLiked(req, res)
})

// Follow routes
// POST /api/users/follow - Follow a user
router.post('/follow', async (req, res) => {
  await userController.followUser(req, res)
})

// DELETE /api/users/follow - Unfollow a user
router.delete('/follow', async (req, res) => {
  await userController.unfollowUser(req, res)
})

// GET /api/users/follow/check - Check if following a user
router.get('/follow/check', async (req, res) => {
  await userController.isFollowing(req, res)
})

// GET /api/users/:userId/followers - Get user's followers
router.get('/:userId/followers', async (req, res) => {
  await userController.getFollowers(req, res)
})

// GET /api/users/:userId/following - Get users that this user is following
router.get('/:userId/following', async (req, res) => {
  await userController.getFollowing(req, res)
})

// Balance routes
// PUT /api/users/:username/balance - Update user balance by username
router.put('/:username/balance', async (req, res) => {
  await userController.updateBalanceByUsername(req, res)
})

// POST /api/users/:username/balance/add - Add to user balance by username
router.post('/:username/balance/add', async (req, res) => {
  await userController.addToBalanceByUsername(req, res)
})

// POST /api/users/:username/balance/subtract - Subtract from user balance by username
router.post('/:username/balance/subtract', async (req, res) => {
  await userController.subtractFromBalanceByUsername(req, res)
})

// GET /api/users/:username/balance - Get user balance by username
router.get('/:username/balance', async (req, res) => {
  await userController.getBalanceByUsername(req, res)
})

// GET /api/users/address/:address/balance - Get user balance by Aptos address
router.get('/address/:address/balance', async (req, res) => {
  await userController.getBalanceByAddress(req, res)
})

// GET /api/users/:userId/follow-stats - Get user's follow statistics
router.get('/:userId/follow-stats', async (req, res) => {
  await userController.getFollowStats(req, res)
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