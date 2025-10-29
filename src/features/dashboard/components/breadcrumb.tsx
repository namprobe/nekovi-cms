// src/features/dashboard/components/breadcrumb.tsx
"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useProductDetail } from "@/features/products/hooks/use-products"
import { ChevronRight, Home } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { useEventDetail } from "@/features/marketing/hooks/use-events"

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
    coupons: "Coupons",

}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  // get product id from url if exists
  const productId = segments.length > 2 && segments[1] === "products" ? segments[2] : undefined
  const { item: product, loading: productLoading } = useProductDetail(productId)
  // get event id from url if exists
  const eventId = segments.length > 2 && segments[1] === "events" ? segments[2] : undefined
  const { item: event, loading: eventLoading } = useEventDetail(eventId)


  const generateBreadcrumbs = (): BreadcrumbItem[] => {
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

      let label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      // Replace ID with entity name if available
      if (i === 2) {
        if (segments[1] === "products" && product && !productLoading) {
          label = product.name || label
        } else if (segments[1] === "events" && event && !eventLoading) {
          label = event.name || label
        }
      }


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