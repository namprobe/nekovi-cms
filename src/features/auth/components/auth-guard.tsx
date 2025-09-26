"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ROUTES } from "@/core/config/routes"
import { type Permission, hasPermission } from "@/core/config/permissions"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermissions?: Permission[]
  fallbackUrl?: string
}

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
    if (!isMounted) return // Wait for client-side mount

    // DEBUG: Log state để debug
    console.log('🔒 AuthGuard State:', { 
      isLoading, 
      isAuthenticated, 
      isMounted,
      requireAuth, 
      hasUser: !!user,
      userRoles: userRoles?.length || 0 
    })

    if (isLoading) {
      console.log('🔒 Still loading...')
      return
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login')
      router.push(fallbackUrl)
      return
    }

    // If user is authenticated but doesn't have required permissions
    if (isAuthenticated && requiredPermissions.length > 0 && user) {
      const hasRequiredPermissions = requiredPermissions.every((permission) => 
        hasPermission(userRoles, permission)
      )

      if (!hasRequiredPermissions) {
        router.push(ROUTES.DASHBOARD) // Redirect to dashboard if no permission
        return
      }
    }
  }, [isMounted, isLoading, isAuthenticated, user, userRoles, requireAuth, requiredPermissions, router, fallbackUrl])

  // Show loading spinner while mounting or loading
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

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If user doesn't have required permissions, don't render children
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
