import axios from 'axios'
import router from '@/router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3100/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor: Add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Variables to handle multiple requests during token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    
    failedQueue = []
}

// Response interceptor: Handle 401, refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }
            
            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                // No refresh token, redirect to login
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                router.push('/login')
                return Promise.reject(error)
            }

            try {
                // Attempt to refresh token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3100/api'}/auth/refresh`,
                    { refreshToken }
                )

                const { token } = response.data.data

                // Update stored token
                localStorage.setItem('token', token)
                
                // Process queued requests
                processQueue(null, token)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh failed, queue must be rejected
                processQueue(refreshError, null)
                
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                router.push('/login')
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api
