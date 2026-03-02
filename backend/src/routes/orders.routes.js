import express from 'express'
import * as ordersController from '../controllers/orders.controller.js'
import { validate } from '../middleware/validator.js'
import { createOrderSchema, updateOrderSchema } from '../utils/validators.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.post('/', validate(createOrderSchema), ordersController.createOrder)
router.get('/', ordersController.getOrders)
router.get('/:id', ordersController.getOrder)
router.patch('/:id/archive', ordersController.archiveOrder)
router.patch('/:id', validate(updateOrderSchema), ordersController.updateOrder)
router.delete('/:id', ordersController.deleteOrder)

export default router
