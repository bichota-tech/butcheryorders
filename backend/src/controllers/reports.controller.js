import prisma from '../config/database.js'
import { generateOrdersExcel } from '../services/excel.service.js'
import logger from '../utils/logger.js'

export const downloadOrdersExcel = async (req, res, next) => {
    try {
        const { startDate, endDate, status, productId } = req.query

        // Build filter
        const where = {}

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate)
        }

        if (status) {
            where.status = status
        }

        if (productId) {
            where.items = {
                some: {
                    productId: productId
                }
            }
        }

        // Fetch orders
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Generate Excel
        const workbook = await generateOrdersExcel(orders)

        // Set headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=pedidos-${Date.now()}.xlsx`)

        // Check if write has promise, usually workbook.xlsx.write(res) returns promise
        await workbook.xlsx.write(res)
        res.end()

        logger.info('Excel report generated', { count: orders.length, user: req.user?.id })

    } catch (error) {
        next(error)
    }
}
