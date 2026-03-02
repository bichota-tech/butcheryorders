import prisma from '../config/database.js'
import logger from '../utils/logger.js'

export const createOrder = async (userId, orderData) => {
    const { items, transcript, voiceRecordingUrl, clientName, clientPhone, pickupDate } = orderData

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
            notes: item.notes,
            transcripcionOriginal: item.transcripcionOriginal || null,
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
            clientName: clientName || null,
            clientPhone: clientPhone || null,
            pickupDate: pickupDate ? new Date(pickupDate) : null,
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

    const where = {
        userId,
        // By default exclude ARCHIVED orders (only show when explicitly filtered)
        ...(status ? { status } : { status: { not: 'ARCHIVED' } })
    }

    // Date filtering - parse as local dates to avoid timezone issues
    if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
            const [y, m, d] = startDate.split('-').map(Number)
            where.createdAt.gte = new Date(y, m - 1, d, 0, 0, 0, 0)
        }
        if (endDate) {
            const [y, m, d] = endDate.split('-').map(Number)
            where.createdAt.lte = new Date(y, m - 1, d, 23, 59, 59, 999)
        }
    }

    // Product filtering (orders containing specific product)
    if (productId) {
        where.items = {
            some: { productId }
        }
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.order.count({ where })
    ])

    // Async purge of old archived orders (>6 months) — does not block response
    purgeOldArchivedOrders(userId).catch(err =>
        logger.warn('Failed to purge old archived orders', { userId, err: err.message })
    )

    return { orders, total, page, limit }
}

export const archiveOrder = async (orderId, userId, isAdmin = false) => {
    const order = await prisma.order.findFirst({
        where: isAdmin ? { id: orderId } : { id: orderId, userId }
    })

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    if (order.status !== 'COMPLETED' && !isAdmin) {
        const error = new Error('Only completed orders can be archived')
        error.statusCode = 403
        throw error
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'ARCHIVED' },
        include: { items: { include: { product: true } } }
    })

    logger.info('Order archived', { orderId, userId })
    return updatedOrder
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

/**
 * Purge ARCHIVED orders older than 6 months.
 * Called automatically on getUserOrders to keep the DB clean.
 */
export const purgeOldArchivedOrders = async (userId) => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const deleted = await prisma.order.deleteMany({
        where: {
            userId,
            status: 'ARCHIVED',
            updatedAt: { lt: sixMonthsAgo }
        }
    })

    if (deleted.count > 0) {
        logger.info('Purged old archived orders', { userId, count: deleted.count })
    }

    return deleted.count
}
