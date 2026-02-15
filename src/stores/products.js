import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as productsService from '@/services/productsService'

export const useProductsStore = defineStore('products', () => {
    const products = ref([])
    const loading = ref(false)
    const error = ref(null)

    const activeProducts = computed(() => products.value.filter((p) => p.isActive))

    const productsByCategory = computed(() => {
        const grouped = {}
        products.value.forEach((product) => {
            if (!grouped[product.category]) {
                grouped[product.category] = []
            }
            grouped[product.category].push(product)
        })
        return grouped
    })

    async function fetchProducts(activeOnly = true) {
        loading.value = true
        error.value = null

        try {
            const data = await productsService.getProducts(activeOnly)
            products.value = data
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch products'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function searchProducts(query) {
        loading.value = true
        error.value = null

        try {
            const data = await productsService.searchProducts(query)
            return data
        } catch (err) {
            error.value = err.response?.data?.message || 'Search failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    function getProductById(productId) {
        return products.value.find((p) => p.id === productId)
    }

    function clearError() {
        error.value = null
    }

    return {
        products,
        loading,
        error,
        activeProducts,
        productsByCategory,
        fetchProducts,
        searchProducts,
        getProductById,
        clearError
    }
})
