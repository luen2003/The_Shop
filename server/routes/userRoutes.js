import express from 'express'
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getPayPalClientId,
  getUserPassword,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// AUTH
router.post('/login', authUser)
router.route('/').post(registerUser).get(protect, getUsers)

// PROFILE
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

router.get('/paypal-client-id', protect, getPayPalClientId)

// UTIL
router.get('/password/:email', getUserPassword)

// 🔥 USER BY ID — ĐẶT CUỐI CÙNG
router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser)

export default router
