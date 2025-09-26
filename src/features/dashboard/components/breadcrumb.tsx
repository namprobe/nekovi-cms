"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { ROUTES } from "@/core/config/routes"

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  products: "Products",
  orders: "Orders",
  blog: "Blog",
  events: "Events",
  reports: "Reports",
  settings: "Settings",
  create: "Create",
  categories: "Categories",
}

export function Breadcrumb() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always start with Dashboard
    breadcrumbs.push({ label: "Dashboard", href: ROUTES.DASHBOARD })

    // Build breadcrumbs from path segments
    let currentPath = ""
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Skip the first 'dashboard' segment as we already added it
      if (segment === "dashboard") continue

      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      // Don't add href for the last segment (current page)
      const isLast = i === segments.length - 1
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
