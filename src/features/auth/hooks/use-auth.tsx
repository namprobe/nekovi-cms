"use client"

import { useEffect, useCallback } from 'react'
import {
    useAuthStore,
    useAuthUser,
    useAuthToken,
    useAuthIsAuthenticated,
    useAuthLoading,
    useAuthError,
    useUserRoles,
    useUserFullName,
    useAuthAccessTokenExpiresAt,
    useAuthIsHydrated,
} from "@/entities/auth/services/auth"
import { apiClient } from "@/core/lib/api-client"

/**
 * Enhanced useAuth Hook - Wrapper around Zustand store
 * Provides convenient access to auth state and actions
 */
export function useAuth() {
    // Lấy actions từ store
    const login = useAuthStore(state => state.login)
    const logout = useAuthStore(state => state.logout)
    const getProfile = useAuthStore(state => state.getProfile)
    const clearError = useAuthStore(state => state.clearError)
    const refreshToken = useAuthStore(state => state.refreshToken)

    // Lấy state từ selectors (better performance)
    const user = useAuthUser()
    const token = useAuthToken()
    const isAuthenticated = useAuthIsAuthenticated()
    const isLoading = useAuthLoading()
    const error = useAuthError()
    const userFullName = useUserFullName()
    const userRoles = useUserRoles()
    const accessTokenExpiresAt = useAuthAccessTokenExpiresAt()
    const isHydrated = useAuthIsHydrated()

    // Initialize authentication state
    const initializeAuth = useCallback(async () => {
        try {
            // Nếu có token trong store (từ localStorage persist)
            if (token) {
                // Set token vào apiClient
                apiClient.setToken(token)

                // Verify token còn valid bằng cách get profile
                if (!user) {
                    await getProfile()
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error)
            // Nếu token invalid, clear state
            await logout()
        }
    }, [token, user, getProfile, logout])

    // Auto-initialize auth state khi app load
    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

     // Helper function: Check if token is expired
     const isTokenExpired = (expiresAt: Date): boolean => {
        try {
            const expiryTime = new Date(expiresAt).getTime()
            const currentTime = Date.now()
            return currentTime >= expiryTime
        } catch (error) {
            console.error('Error parsing token expiry:', error)
            return true // Treat parsing error as expired
        }
    }

    // Helper function: Calculate milliseconds until refresh time (5 minutes before expiry)
    const calculateRefreshTimeout = (expiresAt: Date): number => {
        try {
            const expiryTime = new Date(expiresAt).getTime()
            const currentTime = Date.now()
            const refreshTime = expiryTime - (5 * 60 * 1000) // 5 minutes before expiry
            
            const timeUntilRefresh = refreshTime - currentTime
            
            // Nếu đã quá thời gian refresh hoặc sắp expire, refresh ngay
            return Math.max(timeUntilRefresh, 0)
        } catch (error) {
            console.error('Error calculating refresh timeout:', error)
            return 0 // Refresh immediately on error
        }
    }

    //Auto token refresh (option - impplement if needed)
    useEffect(() => {
        if (!isAuthenticated || !token) return
        // Kiểm tra token đã expired chưa
        if (isTokenExpired(accessTokenExpiresAt as Date)) {
            console.log('Token already expired, logging out...')
            logout()
            return
        }

        // Calculate thời gian để refresh (5 phút trước khi expire)
        const refreshTimeout = calculateRefreshTimeout(accessTokenExpiresAt as Date)

        console.log(`Token refresh scheduled in ${Math.round(refreshTimeout / 1000 / 60)} minutes`)

        // Setup timeout để refresh token
        const timeoutId = setTimeout(async () => {
            console.log('Attempting token refresh...')
            const success = await refreshToken()
            if (!success) {
                console.error('Token refresh failed, logging out...')
                await logout()
            }
        }, refreshTimeout)

        // Cleanup timeout khi component unmount hoặc dependencies thay đổi
        return () => clearTimeout(timeoutId)
    }, [isAuthenticated, token, accessTokenExpiresAt, refreshToken, logout])

    return {
        // State
        user,
        token,
        isAuthenticated,
        isLoading: isLoading, // ← Chỉ loading khi thực sự đang thực hiện action
        error,
        userFullName,
        userRoles,
        accessTokenExpiresAt,
        isHydrated,

        // Actions
        login,
        logout,
        getProfile,
        clearError,
        refreshToken,

        // Utilities
        initializeAuth,
    }
}

// Export individual selectors for specific use cases
export {
    useAuthUser,
    useAuthToken,
    useAuthIsAuthenticated,
    useAuthLoading,
    useAuthError,
    useUserRoles,
    useUserFullName
}
