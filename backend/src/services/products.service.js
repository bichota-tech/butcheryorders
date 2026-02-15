import prisma from '../config/database.js'

export const getAllProducts = async (activeOnly = true) => {
    const products = await prisma.product.findMany({
        where: activeOnly ? { isActive: true } : {},
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
    })

    return products
}

export const getProductById = async (productId) => {
    const product = await prisma.product.findUnique({
        where: { id: productId }
    })

    if (!product) {
        const error = new Error('Product not found')
        error.statusCode = 404
        throw error
    }

    return product
}

export const searchProducts = async (query) => {
    const products = await prisma.product.findMany({
        where: {
            AND: [
                { isActive: true },
                {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } }
                    ]
                }
            ]
        },
        orderBy: { name: 'asc' }
    })

    return products
}
