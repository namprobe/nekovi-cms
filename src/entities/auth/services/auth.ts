import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { AuthState, LoginCredentials, LoginRequest, ProfileResponse, AuthResponse } from "../types"
import { GrantTypeEnum } from "@/shared/types/common"

// Init State - Default values khi app khởi động
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // ← Change back to false
  error: null,
  roles: null,
  tokenExpiresAt: null,
  isHydrated: false, // ← Track hydration state
}

// Singleton refresh timer để tránh multiple refresh calls
let refreshTimerId: NodeJS.Timeout | null = null

// Helper functions for token refresh scheduling
const clearRefreshTimer = () => {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId)
    refreshTimerId = null
  }
}

const isTokenExpired = (expiresAt: Date): boolean => {
  try {
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    return currentTime >= expiryTime
  } catch (error) {
    console.error('Error parsing token expiry:', error)
    return true
  }
}

const calculateRefreshTimeout = (expiresAt: Date): number => {
  try {
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    // Refresh 5 minutes before expiry
    const refreshTime = expiryTime - (5 * 60 * 1000)
    const timeUntilRefresh = refreshTime - currentTime
    return Math.max(timeUntilRefresh, 0)
  } catch (error) {
    console.error('Error calculating refresh timeout:', error)
    return 0
  }
}

const scheduleTokenRefresh = (expiresAt: Date, refreshFn: () => Promise<boolean>, logoutFn: () => Promise<void>) => {
  // Clear any existing timer
  clearRefreshTimer()

  // Check if token is already expired
  if (isTokenExpired(expiresAt)) {
    console.log('Token already expired, logging out...')
    logoutFn()
    return
  }

  const refreshTimeout = calculateRefreshTimeout(expiresAt)
  console.log(`[Auth] Token refresh scheduled in ${Math.round(refreshTimeout / 1000 / 60)} minutes`)

  refreshTimerId = setTimeout(async () => {
    console.log('[Auth] Attempting token refresh...')
    const success = await refreshFn()
    if (!success) {
      console.error('[Auth] Token refresh failed, logging out...')
      await logoutFn()
    }
  }, refreshTimeout)
}

// Create Zustand Store với TypeScript
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        //======STATE PROPERTIES======
        ...initialState,

        //======PUBLIC ACTIONS======

        login: async (credentials: LoginCredentials) => {
          try {
            // Set loading state
            set({ isLoading: true, error: null })

            //Prepare request data cho Backend C#
            const loginRequest: LoginRequest = {
              email: credentials.email,
              password: credentials.password,
              grantType: GrantTypeEnum.Password, //0
            }

            //Call API
            const result = await apiClient.post<AuthResponse>(
              env.ENDPOINTS.AUTH.LOGIN,
              loginRequest
            )

            if (result.isSuccess && result.data) {
              const authData = result.data

              //set token vào api client cho các request sau này
              apiClient.setToken(authData.accessToken)

              //Update store state
              set({
                token: authData.accessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                roles: authData.roles,
                tokenExpiresAt: authData.expiresAt
              })

              // Lấy user profile sau khi login thành công
              await get().getProfile()

              // Schedule automatic token refresh
              scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)

              return { success: true }
            } else {
              //Login failed
              set({
                isLoading: false,
                error: result.message || "Login failed"
              })
              return { success: false, error: result.message || "Login failed" }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage }
          }
        },

        logout: async () => {
          try {
            //call api logout (có thể fail, nhưng vẫn clear local state)
            await apiClient.post(env.ENDPOINTS.AUTH.LOGOUT)
          } catch (error) {
            console.warn("Logout API failed:", error)
            //Ko throw error, vẫn clear local state
          } finally {
            // Clear refresh timer
            clearRefreshTimer()
            
            //clear token từ apiClient
            apiClient.clearToken()

            //Reset store state về init state
            set(initialState)
          }
        },

        refreshToken: async () => {
          try {
            const result = await apiClient.post<AuthResponse>(env.ENDPOINTS.AUTH.REFRESH_TOKEN)

            if (result.isSuccess && result.data) {
              const authData = result.data

              //update token
              apiClient.setToken(authData.accessToken)
              set({ 
                token: authData.accessToken, 
                isAuthenticated: true,
                tokenExpiresAt: authData.expiresAt 
              })

              // Schedule next automatic token refresh
              scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)

              return true
            } else {
              //refresh failed - logout user
              await get().logout()
              return false
            }
          } catch (error) {
            console.error('Token refresh error:', error)
            await get().logout()
            return false
          }
        },

        getProfile: async () => {
          try {
            const result = await apiClient.get<ProfileResponse>(env.ENDPOINTS.AUTH.PROFILE)

            if (result.isSuccess && result.data) {
              set({ user: result.data })
            } else {
              console.error("Failed to get profile", result.message)
            }
          } catch (error) {
            console.error("Get profile error:", error)
          }
        },
        clearError: () => {
          set({ error: null })
        },
        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        //======PRIVATE ACTIONS======
        _setUser: (user: ProfileResponse | null) => {
          set({ user })
        },

        _setToken: (token: string | null) => {
          set({ token, isAuthenticated: !!token })
          if (token) {
            apiClient.setToken(token)
          } else {
            apiClient.clearToken()
          }
        },

        _setError: (error: string | null) => {
          set({ error })
        },

        _setHydrated: (hydrated: boolean) => {
          set({ isHydrated: hydrated })
        },

        _reset: () => {
          set(initialState)
        }
      }),
      {
        name: "auth-store", // localStorage key name
        partialize: (state) => ({
          // chỉ persist những field cần thiết
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          roles: state.roles,
          tokenExpiresAt: state.tokenExpiresAt,
          // ko persist: isLoading, error, isHydrated (transient state)
        }),
        onRehydrateStorage: () => (state) => {
          state?._setHydrated(true)
          
          // Schedule token refresh after hydration if user is authenticated
          if (state?.isAuthenticated && state?.tokenExpiresAt) {
            scheduleTokenRefresh(
              state.tokenExpiresAt as Date, 
              state.refreshToken, 
              state.logout
            )
          }
        },
      }
    ),
    {
      name: "auth-store", //dev tools name
    }
  )
)

//=========== SELECTOR HOOKS ===========

export const useAuthUser = () => useAuthStore(state => state.user)
export const useAuthToken = () => useAuthStore(state => state.token)
export const useAuthIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useAuthError = () => useAuthStore(state => state.error)
export const useAuthAccessTokenExpiresAt = () => useAuthStore(state => state.tokenExpiresAt)
export const useAuthIsHydrated = () => useAuthStore(state => state.isHydrated)

// Derived selectors - với proper memoization
export const useUserRoles = () => {
  return useAuthStore(state => state.roles) || []
}

export const useUserFullName = () => {
  return useAuthStore(state => {
    if (!state.user) return null
    return `${state.user.firstName} ${state.user.lastName}`
  })
}