import { GrantTypeEnum } from "@/shared/types/common"

export interface LoginRequest {
    email: string
    password: string
    grantType: GrantTypeEnum
}

export interface AuthResponse {
    accessToken: string
    roles: string[]
    expiresAt: Date
}

export interface ProfileResponse {
    email: string
    firstName?: string
    lastName?: string
    phoneNumber?: string
    gender?: string
    dateOfBirth?: Date
    bio?: string
    avatarPath?: string
    position?: string
    hireDate?: Date
    salary?: number
}

//=====Zustand Store Types=====
export interface LoginCredentials {
    email: string
    password: string
    rememberMe?: boolean
}

//Auth Store State Interface
export interface AuthState {
    // State Properties
    user: ProfileResponse | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    roles: string[] | null
    tokenExpiresAt: Date | null
    isHydrated: boolean

    // Action Methods
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    refreshToken: () => Promise<boolean>
    getProfile: () => Promise<void>
    clearError: () => void
    setLoading: (loading: boolean) => void

    // Internal Methods (không expose ra ngoài)
    _setUser: (user: ProfileResponse | null) => void
    _setToken: (token: string | null) => void
    _setError: (error: string | null) => void
    _setHydrated: (hydrated: boolean) => void
    _reset: () => void
}


