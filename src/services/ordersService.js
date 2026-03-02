import api from './api'

export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data.data
}

export const getOrders = async (page = 1, limit = 10, filters = {}) => {
    const response = await api.get('/orders', {
        params: { page, limit, ...filters }
    })
    return response.data
}

export const exportOrders = async (filters = {}) => {
    const response = await api.get('/reports/excel', {
        params: filters,
        responseType: 'blob'
    })
    return response.data
}

export const getOrderById = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data.data
}

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}`, { status })
    return response.data.data
}

export const deleteOrder = async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`)
    return response.data.data
}

export const archiveOrder = async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/archive`)
    return response.data.data
}
