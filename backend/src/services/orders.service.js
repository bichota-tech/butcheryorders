import prisma from '../config/database.js'
import logger from '../utils/logger.js'

export const createOrder = async (userId, orderData) => {
    const { items, transcript, voiceRecordingUrl } = orderData

    // Calculate total amount
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId }
        })

        if (!product || !product.isActive) {
            const error = new Error(`Product ${item.productId} not found or inactive`)
            error.statusCode = 404
            throw error
        }

        const itemTotal = parseFloat(product.pricePerUnit) * parseFloat(item.quantity)
        totalAmount += itemTotal

        orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit,
            priceAtTime: product.pricePerUnit
        })
    }

    // Create order with items
    const order = await prisma.order.create({
        data: {
            userId,
            totalAmount,
            transcript,
            voiceRecordingUrl,
            status: 'PENDING',
            items: {
                create: orderItems
            }
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })

    logger.info('Order created', { orderId: order.id, userId, totalAmount })

    return order
}

export const getUserOrders = async (userId, page = 1, limit = 10, filters = {}) => {
    const skip = (page - 1) * limit
    const { startDate, endDate, productId, status } = filters

    const where = { userId }

    // Date filtering
    if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = new Date(startDate)
        if (endDate) {
            // Set to end of day (23:59:59.999) to include all orders on that date
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt.lte = end
        }
    }

    // Status filtering
    if (status) {
        where.status = status
    }

    // Product filtering (orders containing specific product)
    if (productId) {
        where.items = {
            some: {
                productId: productId
            }
        }
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.order.count({ where })
    ])

    return { orders, total, page, limit }
}

export const getOrderById = async (orderId, userId) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId // Ensure user can only access their own orders
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    return order
}

export const updateOrderStatus = async (orderId, userId, status, isAdmin = false) => {
    // Check if order exists and belongs to user (unless admin)
    const order = await prisma.order.findFirst({
        where: isAdmin ? { id: orderId } : { id: orderId, userId }
    })

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })

    logger.info('Order status updated', { orderId, status, userId })

    return updatedOrder
}

export const deleteOrder = async (orderId, userId, isAdmin = false) => {
    const order = await prisma.order.findFirst({
        where: isAdmin ? { id: orderId } : { id: orderId, userId }
    })

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    // Only allow deletion of pending orders
    if (order.status !== 'PENDING' && !isAdmin) {
        const error = new Error('Only pending orders can be deleted')
        error.statusCode = 403
        throw error
    }

    await prisma.order.delete({
        where: { id: orderId }
    })

    logger.info('Order deleted', { orderId, userId })

    return { id: orderId }
}
