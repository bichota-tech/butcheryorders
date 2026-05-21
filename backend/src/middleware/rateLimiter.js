import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { message: 'Demasiados intentos de inicio de sesión, intente de nuevo en 15 minutos.' },
    skipSuccessfulRequests: false,
    standardHeaders: true,
    legacyHeaders: false
})

export const voiceLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 voice requests per minute
    message: 'Too many voice requests, please slow down'
})