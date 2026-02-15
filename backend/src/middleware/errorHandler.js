import logger from '../utils/logger.js'
import { errorResponse } from '../utils/responses.js'

export const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    })

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json(errorResponse('Resource already exists'))
    }

    if (err.code === 'P2025') {
        return res.status(404).json(errorResponse('Resource not found'))
    }

    // Validation errors
    if (err.isJoi) {
        return res.status(400).json(
            errorResponse('Validation error', err.details.map((d) => d.message))
        )
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(errorResponse('Invalid token'))
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponse('Token expired'))
    }

    // Default error
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error'

    res.status(statusCode).json(errorResponse(message))
}

export const notFoundHandler = (req, res) => {
    res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`))
}
