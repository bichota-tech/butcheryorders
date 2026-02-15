import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validator.js'
import { registerSchema, loginSchema } from '../utils/validators.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)

// Protected route
router.get('/me', authenticateToken, authController.me)

export default router
