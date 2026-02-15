import express from 'express'
import * as productsController from '../controllers/products.controller.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.get('/', productsController.getProducts)
router.get('/search', productsController.searchProducts)
router.get('/:id', productsController.getProduct)

export default router
