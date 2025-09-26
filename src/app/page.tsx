"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ROUTES } from "@/core/config/routes"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push(ROUTES.DASHBOARD)
      } else {
        router.push(ROUTES.LOGIN)
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking authentication or redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
