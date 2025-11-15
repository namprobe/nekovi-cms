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

    // Note: Token refresh scheduling is now handled in the Zustand store (auth.ts)
    // to prevent multiple refresh calls when multiple components mount

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
