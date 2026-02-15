import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import corsMiddleware from './config/cors.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import logger from './utils/logger.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import productsRoutes from './routes/products.routes.js'
import voiceRoutes from './routes/voice.routes.js'
import reportsRoutes from './routes/reports.routes.js'

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(corsMiddleware)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api', generalLimiter)

// Request logging
app.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
    })
    next()
})

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/reports', reportsRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`)
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`🔗 API available at http://localhost:${PORT}/api`)
})

export default app
