"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ROUTES } from "@/core/config/routes"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.push(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, isLoading, router])

  // Don't render auth pages if user is already authenticated
  if (!isLoading && isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  )
}
