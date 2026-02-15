import * as productsService from '../services/products.service.js'
import { successResponse } from '../utils/responses.js'

export const getProducts = async (req, res, next) => {
    try {
        const activeOnly = req.query.active !== 'false'
        const products = await productsService.getAllProducts(activeOnly)

        res.json(successResponse(products, 'Products retrieved'))
    } catch (error) {
        next(error)
    }
}

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const product = await productsService.getProductById(id)

        res.json(successResponse(product, 'Product retrieved'))
    } catch (error) {
        next(error)
    }
}

export const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query

        if (!q) {
            const error = new Error('Search query required')
            error.statusCode = 400
            throw error
        }

        const products = await productsService.searchProducts(q)

        res.json(successResponse(products, 'Search results'))
    } catch (error) {
        next(error)
    }
}
