# 📚 **AUTHENTICATION FLOW GUIDE - ZUSTAND + NEXT.JS**

> Tổng kết luồng xử lý Authentication với Zustand, Next.js và Clean Architecture

## 🏗️ **KIẾN TRÚC TỔNG QUAN**

```
📁 Clean Architecture Auth System
├─ 🎯 Core Layer (State Management)
│   └─ entities/auth/services/auth.ts     ← Zustand Store + API calls
├─ 🎣 Business Logic Layer  
│   └─ features/auth/hooks/use-auth.tsx   ← Business logic wrapper
├─ 🔒 Protection Layer
│   └─ features/auth/components/auth-guard.tsx ← Route protection
└─ 🎨 UI Layer
    └─ features/auth/components/login-form.tsx ← Authentication UI
```

## 🚀 **LUỒNG XỬ LÝ AUTHENTICATION**

### **1. 🎯 Zustand Store (Global State)**

File: `src/entities/auth/services/auth.ts`

```typescript
const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // State Properties
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,     // ← Key: Start with false
        error: null,
        roles: null,
        tokenExpiresAt: null,
        isHydrated: false,

        // Core Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null })
          
          const loginRequest = {
            email: credentials.email,
            password: credentials.password,
            grantType: GrantTypeEnum.Password
          }

          const result = await apiClient.post<AuthResponse>(
            env.ENDPOINTS.AUTH.LOGIN,
            loginRequest
          )

          if (result.isSuccess && result.data) {
            const authData = result.data
            apiClient.setToken(authData.accessToken)
            
            set({
              token: authData.accessToken,
              isAuthenticated: true,
              isLoading: false,
              roles: authData.roles,
              tokenExpiresAt: authData.expiresAt
            })

            await get().getProfile()
            return { success: true }
          }
        },

        logout: async () => {
          try {
            await apiClient.post(env.ENDPOINTS.AUTH.LOGOUT)
          } catch (error) {
            console.warn("Logout API failed:", error)
          } finally {
            apiClient.clearToken()
            set(initialState) // ← Clean reset
          }
        },

        refreshToken: async () => {
          const result = await apiClient.post<AuthResponse>(
            env.ENDPOINTS.AUTH.REFRESH_TOKEN
          )
          
          if (result.isSuccess && result.data) {
            const authData = result.data
            apiClient.setToken(authData.accessToken)
            set({ 
              token: authData.accessToken, 
              isAuthenticated: true,
              tokenExpiresAt: authData.expiresAt 
            })
            return true
          } else {
            await get().logout()
            return false
          }
        },

        getProfile: async () => {
          const result = await apiClient.get<ProfileResponse>(
            env.ENDPOINTS.AUTH.PROFILE
          )
          
          if (result.isSuccess && result.data) {
            set({ user: result.data })
          }
        }
      }),
      {
        name: "auth-store",
        partialize: (state) => ({
          // Chỉ persist data cần thiết
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          roles: state.roles,
          tokenExpiresAt: state.tokenExpiresAt,
          // Không persist: isLoading, error, isHydrated
        })
      }
    )
  )
)

// Selector hooks for performance
export const useAuthUser = () => useAuthStore(state => state.user)
export const useAuthToken = () => useAuthStore(state => state.token)
export const useAuthIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useUserRoles = () => useAuthStore(state => state.roles) || []
```

### **2. 🎣 Business Logic Hook**

File: `src/features/auth/hooks/use-auth.tsx`

```typescript
export function useAuth() {
  // Zustand selectors
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const refreshToken = useAuthStore(state => state.refreshToken)
  
  const user = useAuthUser()
  const token = useAuthToken()
  const isAuthenticated = useAuthIsAuthenticated()
  const isLoading = useAuthLoading()
  const userRoles = useUserRoles()

  // Auto-initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      if (token) {
        apiClient.setToken(token)
        if (!user) {
          await getProfile()
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      await logout()
    }
  }

  // Auto token refresh logic
  useEffect(() => {
    if (!isAuthenticated || !token) return
    
    if (isTokenExpired(accessTokenExpiresAt)) {
      logout()
      return
    }

    const refreshTimeout = calculateRefreshTimeout(accessTokenExpiresAt)
    const timeoutId = setTimeout(async () => {
      const success = await refreshToken()
      if (!success) {
        await logout()
      }
    }, refreshTimeout)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, token, accessTokenExpiresAt])

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    userRoles,
    
    // Actions
    login,
    logout,
    refreshToken,
    initializeAuth
  }
}
```

### **3. 🔒 Route Protection**

File: `src/features/auth/components/auth-guard.tsx`

```typescript
export function AuthGuard({
  children,
  requireAuth = true,
  requiredPermissions = [],
  fallbackUrl = ROUTES.LOGIN,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, userRoles } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return // ← Wait for client-side mount
    
    if (isLoading) return // ← Wait for auth operations
    
    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackUrl)
      return
    }

    // Check permissions
    if (isAuthenticated && requiredPermissions.length > 0 && user) {
      const hasRequiredPermissions = requiredPermissions.every((permission) => 
        hasPermission(userRoles, permission)
      )

      if (!hasRequiredPermissions) {
        router.push(ROUTES.DASHBOARD)
        return
      }
    }
  }, [isMounted, isLoading, isAuthenticated, user, userRoles])

  // Show loading while mounting or auth operations
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {!isMounted ? "Loading..." : "Authenticating..."}
          </p>
        </div>
      </div>
    )
  }

  // If authentication required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Permission check failed
  if (isAuthenticated && requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every((permission) => 
      hasPermission(userRoles, permission)
    )

    if (!hasRequiredPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
```

## 🔧 **XỬ LÝ CÁC CASE ĐẶC BIỆT**

### **🔄 Case 1: RELOAD PAGE - Không bị đẩy về Login**

**Vấn đề:** 
- Khi reload page, Zustand chưa kịp hydrate từ localStorage
- `isAuthenticated = false` tạm thời
- AuthGuard redirect về login ngay lập tức

**Giải pháp:**

```typescript
// 1. Sử dụng isMounted để đợi client-side hydration
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])

// 2. Chỉ check auth sau khi component mounted
if (!isMounted) return <LoadingSpinner />

// 3. Zustand persist tự động restore state từ localStorage
const useAuthStore = create()(persist(/*...*/, {
  partialize: (state) => ({
    token: state.token,
    user: state.user, 
    isAuthenticated: state.isAuthenticated
  })
}))
```

**Flow hoạt động:**
```
📱 User Reload Page
├─ ⏳ isMounted = false → Show loading
├─ 🔄 Zustand hydrates từ localStorage  
├─ ✅ isMounted = true → Check auth state
├─ ✅ isAuthenticated = true (from localStorage)
└─ 🎯 Stay on current page
```

### **🚪 Case 2: LOGOUT + Back Button - Không bị Stuck**

**Vấn đề:**
- Sau logout, back về protected page
- AuthGuard stuck ở loading vì các logic phức tạp
- `isLoading` luôn = `true`

**Giải pháp:**

```typescript
// 1. Simplify initial state
const initialState = {
  isLoading: false,  // ← Start with false, not true
  isAuthenticated: false,
  // ...
}

// 2. Clean logout logic
logout: async () => {
  try {
    await apiClient.post('/logout') // API call
  } catch (error) {
    console.warn("Logout API failed:", error)
  } finally {
    apiClient.clearToken()          // Clear API token
    set(initialState)               // Reset to clean state
  }
}

// 3. Simple AuthGuard logic  
if (!isMounted || isLoading) return <LoadingSpinner />
if (requireAuth && !isAuthenticated) {
  router.push('/login')
  return
}
```

**Flow hoạt động:**
```
👤 User Logout
├─ 🧹 Clear all auth state
├─ 🔄 Reset to initialState (isLoading = false)
└─ 🎯 Ready for next auth check

🔙 User Back to Protected Page  
├─ ⚡ isMounted = true immediately
├─ ⚡ isLoading = false (clean state)
├─ ❌ isAuthenticated = false
└─ 🚪 Redirect to login (no stuck)
```

## 🎯 **KEY SOLUTIONS IMPLEMENTED**

### **✅ 1. Client-Side Mount Detection**
```typescript
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
```
- **Mục đích:** Tránh hydration mismatch giữa server và client
- **Kết quả:** Smooth loading experience khi reload

### **✅ 2. Minimal Loading States**  
```typescript
const initialState = { isLoading: false } // Not true!
```
- **Mục đích:** Tránh stuck ở loading state
- **Kết quả:** Fast auth checks sau logout

### **✅ 3. Smart Persistence**
```typescript
partialize: (state) => ({
  // Chỉ persist data cần thiết, không persist transient state
  token: state.token,
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  roles: state.roles,
  tokenExpiresAt: state.tokenExpiresAt
  // Ko persist: isLoading, error, isHydrated
})
```
- **Mục đích:** Persistence hiệu quả, tránh conflict
- **Kết quả:** Reliable state restoration

### **✅ 4. Auto Token Refresh**
```typescript
useEffect(() => {
  if (!isAuthenticated || !token) return
  
  const refreshTimeout = calculateRefreshTimeout(expiresAt)
  const timeoutId = setTimeout(async () => {
    const success = await refreshToken()
    if (!success) await logout()
  }, refreshTimeout)
  
  return () => clearTimeout(timeoutId)
}, [isAuthenticated, token, expiresAt])
```
- **Mục đích:** Maintain session liên tục
- **Kết quả:** User không bị logout đột ngột

### **✅ 5. Selector Optimization**
```typescript
// Separate selectors for better performance
export const useAuthUser = () => useAuthStore(state => state.user)
export const useAuthIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useUserRoles = () => useAuthStore(state => state.roles) || []
```
- **Mục đích:** Minimize re-renders
- **Kết quả:** Better performance

## 🚀 **API INTEGRATION**

### **Backend C# Integration**
```typescript
// Login request matching C# backend
const loginRequest: LoginRequest = {
  email: credentials.email,
  password: credentials.password,
  grantType: GrantTypeEnum.Password // 0
}

// Handle C# Result pattern
const result = await apiClient.post<AuthResponse>(
  env.ENDPOINTS.AUTH.LOGIN,
  loginRequest
)

if (result.isSuccess && result.data) {
  // Success handling
} else {
  // Error handling with backend message
  set({ error: result.message || "Login failed" })
}
```

### **Error Handling**
```typescript
// Network errors
try {
  const result = await apiClient.post(/*...*/)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Network error"
  set({ error: errorMessage })
}

// Backend errors
if (!result.isSuccess) {
  set({ error: result.message || "Operation failed" })
}
```

## 📱 **USAGE EXAMPLES**

### **Layout Protection**
```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </AuthGuard>
  )
}
```

### **Permission-based Protection**
```typescript
// Specific page with permission requirements
<AuthGuard 
  requireAuth={true}
  requiredPermissions={[Permission.MANAGE_USERS]}
>
  <UserManagementPage />
</AuthGuard>
```

### **Login Form Usage**
```typescript
export function LoginForm() {
  const login = useAuthStore(state => state.login)
  const isLoading = useAuthStore(state => state.isLoading)
  const error = useAuthStore(state => state.error)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    })
    
    if (result.success) {
      router.push(ROUTES.DASHBOARD)
    }
  }
}
```

## 🚀 **KẾT QUẢ CUỐI CÙNG**

| **Scenario** | **Behavior** | **Status** |
|--------------|--------------|------------|
| 🔄 **Reload page khi đã login** | Ở lại trang hiện tại | ✅ **Fixed** |
| 🚪 **Logout → Back button** | Redirect về login smooth | ✅ **Fixed** |
| ⚡ **First time visit protected page** | Redirect về login | ✅ **Working** |
| 🔄 **Auto token refresh** | Seamless background refresh | ✅ **Working** |
| 🎯 **Fast auth checks** | No loading delays | ✅ **Optimized** |
| 🔒 **Permission checks** | Role-based access control | ✅ **Working** |
| 📱 **Responsive loading** | Smooth UX transitions | ✅ **Optimized** |

## 💡 **ARCHITECTURE BENEFITS**

- **🎯 Clean:** Zustand thay thế React Context (ít boilerplate)
- **⚡ Fast:** Minimal re-renders với selective subscriptions  
- **🔧 Maintainable:** Clear separation of concerns
- **🛡️ Type-safe:** Full TypeScript support
- **📱 Responsive:** Smooth UX trên mọi scenarios
- **🔄 Reliable:** Robust error handling và edge cases
- **🚀 Scalable:** Easy to extend với new features

## 🔍 **DEBUGGING TIPS**

### **Common Issues & Solutions**

1. **Stuck at loading:**
   ```typescript
   // Check initial state
   const initialState = { isLoading: false } // Must be false
   ```

2. **Hydration mismatch:**
   ```typescript
   // Use isMounted pattern
   const [isMounted, setIsMounted] = useState(false)
   useEffect(() => setIsMounted(true), [])
   ```

3. **Token not persisting:**
   ```typescript
   // Check partialize config
   partialize: (state) => ({
     token: state.token, // Must include
     isAuthenticated: state.isAuthenticated // Must include
   })
   ```

4. **Auto-refresh not working:**
   ```typescript
   // Check dependencies
   useEffect(() => {
     // refresh logic
   }, [isAuthenticated, token, expiresAt]) // All dependencies
   ```

**Kết quả: Authentication system hoạt động mượt mà, không còn edge cases! 🎉**

---

## 📝 **CHANGELOG**

### **v1.0 - Initial Implementation**
- ✅ Basic Zustand store setup
- ✅ Login/logout functionality
- ✅ Route protection with AuthGuard

### **v1.1 - Hydration Fixes** 
- ✅ Fixed reload page redirecting to login
- ✅ Added client-side mount detection
- ✅ Optimized persistence configuration

### **v1.2 - Loading State Fixes**
- ✅ Fixed logout → back button stuck issue
- ✅ Simplified loading state logic
- ✅ Clean state reset on logout

### **v1.3 - Performance Optimization**
- ✅ Added selective Zustand selectors
- ✅ Minimized re-renders
- ✅ Auto token refresh implementation

---

**📄 Created:** 2024-12-19  
**👨‍💻 Author:** Clean Architecture Team  
**🔄 Last Updated:** 2024-12-19
