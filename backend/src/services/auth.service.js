import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'
import authConfig from '../config/auth.js'
import logger from '../utils/logger.js'

export const register = async (email, password, name) => {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        const error = new Error('User already exists')
        error.statusCode = 409
        throw error
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            role: 'USER'
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    })

    logger.info('New user registered', { userId: user.id, email: user.email })

    // Generate tokens
    const tokens = await generateTokens(user)

    return { user, ...tokens }
}

export const login = async (email, password) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        const error = new Error('Invalid credentials')
        error.statusCode = 401
        throw error
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
        logger.warn('Failed login attempt', { email })
        const error = new Error('Invalid credentials')
        error.statusCode = 401
        throw error
    }

    logger.info('User logged in', { userId: user.id, email: user.email })

    // Generate tokens
    const tokens = await generateTokens(user)

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword, ...tokens }
}

export const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, authConfig.refreshSecret)

        // Check if refresh token exists in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        })

        if (!storedToken || storedToken.expiresAt < new Date()) {
            const error = new Error('Invalid or expired refresh token')
            error.statusCode = 401
            throw error
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { id: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn }
        )

        return { token: accessToken }
    } catch (err) {
        logger.error('Refresh token error', { error: err.message })
        const error = new Error('Invalid refresh token')
        error.statusCode = 401
        throw error
    }
}

export const logout = async (refreshToken) => {
    await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
    })

    logger.info('User logged out')
}

// Helper function to generate tokens
const generateTokens = async (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn }
    )

    const refreshToken = jwt.sign({ id: user.id }, authConfig.refreshSecret, {
        expiresIn: authConfig.refreshExpiresIn
    })

    // Store refresh token in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt
        }
    })

    return { token: accessToken, refreshToken }
}
