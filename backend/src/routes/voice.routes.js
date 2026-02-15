import express from 'express'
import * as voiceController from '../controllers/voice.controller.js'
import { authenticateToken } from '../middleware/auth.js'
import { voiceLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// All routes require authentication and have voice-specific rate limiting
router.use(authenticateToken)
router.use(voiceLimiter)

router.post('/process', voiceController.processTranscript)

export default router
