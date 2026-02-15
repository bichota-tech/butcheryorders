import * as authService from '../services/auth.service.js'
import { successResponse } from '../utils/responses.js'
import logger from '../utils/logger.js'

export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body
        const result = await authService.register(email, password, name)

        res.status(201).json(successResponse(result, 'User registered successfully'))
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const result = await authService.login(email, password)

        res.json(successResponse(result, 'Login successful'))
    } catch (error) {
        next(error)
    }
}

export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            const error = new Error('Refresh token required')
            error.statusCode = 400
            throw error
        }

        const result = await authService.refreshAccessToken(refreshToken)

        res.json(successResponse(result, 'Token refreshed'))
    } catch (error) {
        next(error)
    }
}

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            const error = new Error('Refresh token required')
            error.statusCode = 400
            throw error
        }

        await authService.logout(refreshToken)

        res.json(successResponse(null, 'Logout successful'))
    } catch (error) {
        next(error)
    }
}

export const me = async (req, res) => {
    // req.user is set by authenticateToken middleware
    res.json(successResponse(req.user, 'User profile retrieved'))
}
