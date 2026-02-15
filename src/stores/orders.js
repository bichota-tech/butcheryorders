import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as ordersService from '@/services/ordersService'

export const useOrdersStore = defineStore('orders', () => {
    const orders = ref([])
    const currentOrder = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const pagination = ref({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const filters = ref({
        startDate: '',
        endDate: '',
        status: '',
        productId: ''
    })

    const pendingOrders = computed(() => orders.value.filter((o) => o.status === 'PENDING'))
    const completedOrders = computed(() => orders.value.filter((o) => o.status === 'COMPLETED'))

    async function fetchOrders(page = 1, limit = 10) {
        loading.value = true
        error.value = null

        try {
            // Clean filters
            const cleanFilters = Object.fromEntries(
                Object.entries(filters.value).filter(([_, v]) => v !== '' && v !== null)
            )

            const response = await ordersService.getOrders(page, limit, cleanFilters)
            orders.value = response.data
            pagination.value = response.pagination
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch orders'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function exportOrders() {
        loading.value = true
        error.value = null
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters.value).filter(([_, v]) => v !== '' && v !== null)
            )
            const blob = await ordersService.exportOrders(cleanFilters)

            // Create download link
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `pedidos-${new Date().toISOString().slice(0, 10)}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            error.value = 'Failed to export orders'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    async function fetchOrderById(orderId) {
        loading.value = true
        error.value = null

        try {
            const order = await ordersService.getOrderById(orderId)
            currentOrder.value = order
            return order
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch order'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createOrder(orderData) {
        loading.value = true
        error.value = null

        try {
            const order = await ordersService.createOrder(orderData)
            orders.value.unshift(order) // Add to beginning of list
            return order
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create order'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateOrder(orderId, status) {
        loading.value = true
        error.value = null

        try {
            const updatedOrder = await ordersService.updateOrderStatus(orderId, status)

            // Update in list
            const index = orders.value.findIndex((o) => o.id === orderId)
            if (index !== -1) {
                orders.value[index] = updatedOrder
            }

            // Update current order if it's the same
            if (currentOrder.value?.id === orderId) {
                currentOrder.value = updatedOrder
            }

            return updatedOrder
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update order'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteOrder(orderId) {
        loading.value = true
        error.value = null

        try {
            await ordersService.deleteOrder(orderId)

            // Remove from list
            orders.value = orders.value.filter((o) => o.id !== orderId)

            // Clear current order if it's the same
            if (currentOrder.value?.id === orderId) {
                currentOrder.value = null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete order'
            throw err
        } finally {
            loading.value = false
        }
    }

    function clearError() {
        error.value = null
    }

    function clearCurrentOrder() {
        currentOrder.value = null
    }

    return {
        orders,
        currentOrder,
        loading,
        error,
        pagination,
        pendingOrders,
        completedOrders,
        filters,
        fetchOrders,
        fetchOrderById,
        createOrder,
        updateOrder,
        deleteOrder,
        exportOrders,
        clearError,
        clearCurrentOrder
    }
})
