import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const refreshToken = ref(localStorage.getItem('refreshToken'))
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')

    async function login(email, password) {
        loading.value = true
        error.value = null

        try {
            const response = await authService.login(email, password)
            setAuthData(response)
            router.push('/')
        } catch (err) {
            error.value = err.response?.data?.message || 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function register(email, password, name) {
        loading.value = true
        error.value = null

        try {
            const response = await authService.register(email, password, name)
            setAuthData(response)
            router.push('/')
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function fetchProfile() {
        if (!token.value) return

        try {
            const profile = await authService.getProfile()
            user.value = profile
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            logout()
        }
    }

    async function refreshTokenAction() {
        if (!refreshToken.value) {
            logout()
            return
        }

        try {
            const response = await authService.refresh(refreshToken.value)
            token.value = response.token
            localStorage.setItem('token', response.token)
        } catch (err) {
            console.error('Token refresh failed:', err)
            logout()
        }
    }

    function logout() {
        // Attempt to logout on server (don't wait for response)
        if (refreshToken.value) {
            authService.logout(refreshToken.value).catch(() => { })
        }

        user.value = null
        token.value = null
        refreshToken.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
    }

    function setAuthData(data) {
        user.value = data.user
        token.value = data.token
        refreshToken.value = data.refreshToken
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
    }

    function clearError() {
        error.value = null
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        register,
        fetchProfile,
        refreshToken: refreshTokenAction,
        logout,
        clearError
    }
})
