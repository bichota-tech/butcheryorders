import api from './api'

export const getProducts = async (activeOnly = true) => {
    const response = await api.get('/products', {
        params: { active: activeOnly }
    })
    return response.data.data
}

export const getProductById = async (productId) => {
    const response = await api.get(`/products/${productId}`)
    return response.data.data
}

export const searchProducts = async (query) => {
    const response = await api.get('/products/search', {
        params: { q: query }
    })
    return response.data.data
}
