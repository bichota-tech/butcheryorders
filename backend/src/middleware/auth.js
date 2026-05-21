import jwt from 'jsonwebtoken'
import authConfig from '../config/auth.js'
import { errorResponse } from '../utils/responses.js'
import logger from '../utils/logger.js'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
        return res.status(401).json(errorResponse('Access token required'))
    }

    jwt.verify(token, authConfig.secret, (err, user) => {
        if (err) {
            logger.warn('Invalid token attempt', { error: err.message })
            return res.status(403).json(errorResponse('Invalid or expired token'))
        }

        req.user = user
        next()
    })
}

export const requireAdmin = (req, res, next) => {
    // ✅ FIX: Validar que req.user existe antes de acceder a sus propiedades
    if (!req.user) {
        logger.warn('Admin access attempt without user context')
        return res.status(403).json(errorResponse('User context not found'))
    }

    if (req.user.role !== 'ADMIN') {
        logger.warn('Unauthorized admin access attempt', { userId: req.user.id })
        return res.status(403).json(errorResponse('Admin access required'))
    }
    next()
}
