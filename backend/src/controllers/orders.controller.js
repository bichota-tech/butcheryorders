import * as ordersService from '../services/orders.service.js'
import { successResponse, paginatedResponse } from '../utils/responses.js'

export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id
        const order = await ordersService.createOrder(userId, req.body)

        res.status(201).json(successResponse(order, 'Order created successfully'))
    } catch (error) {
        next(error)
    }
}

export const getOrders = async (req, res, next) => {
    try {
        const userId = req.user.id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            productId: req.query.productId,
            status: req.query.status
        }

        const { orders, total } = await ordersService.getUserOrders(userId, page, limit, filters)

        res.json(paginatedResponse(orders, page, limit, total))
    } catch (error) {
        next(error)
    }
}

export const getOrder = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        const order = await ordersService.getOrderById(id, userId)

        res.json(successResponse(order, 'Order retrieved'))
    } catch (error) {
        next(error)
    }
}

export const updateOrder = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const { status } = req.body
        const isAdmin = req.user.role === 'ADMIN'

        const order = await ordersService.updateOrderStatus(id, userId, status, isAdmin)

        res.json(successResponse(order, 'Order updated'))
    } catch (error) {
        next(error)
    }
}

export const deleteOrder = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const isAdmin = req.user.role === 'ADMIN'

        const result = await ordersService.deleteOrder(id, userId, isAdmin)

        res.json(successResponse(result, 'Order deleted'))
    } catch (error) {
        next(error)
    }
}

export const archiveOrder = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const isAdmin = req.user.role === 'ADMIN'

        const order = await ordersService.archiveOrder(id, userId, isAdmin)

        res.json(successResponse(order, 'Order archived'))
    } catch (error) {
        next(error)
    }
}
