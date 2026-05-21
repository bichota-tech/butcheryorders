import { Router } from 'express'
import { downloadOrdersExcel } from '../controllers/reports.controller.js'
import { authenticateToken } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// Enforcing admin-only access for exporting reports
router.get('/excel', authenticateToken, requireAdmin, downloadOrdersExcel)

export default router
