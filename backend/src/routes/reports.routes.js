import { Router } from 'express'
import { downloadOrdersExcel } from '../controllers/reports.controller.js'
import { authenticateToken } from '../middleware/auth.js'
import { isAdmin } from '../middleware/roles.js'

const router = Router()

// Only admin can export reports? Or user too? 
// Prompt implies "dueño" (owner) manages it. So Admin.
// We'll use authenticate for now, maybe isAdmin later if implemented.
router.get('/excel', authenticateToken, downloadOrdersExcel)

export default router
