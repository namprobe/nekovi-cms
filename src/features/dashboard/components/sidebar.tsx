//src/features/dashboard/components/sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/core/lib/utils"
import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { ROUTES } from "@/core/config/routes"
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Tags,
  Ticket,
  Badge,
  ImageIcon,
  Film,
  BadgePercent,
  CreditCard,
  Truck,
} from "lucide-react"


interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    name: "Users",
    href: ROUTES.USERS,
    icon: Users,
  },
  {
    name: "Products",
    href: ROUTES.PRODUCTS,
    icon: Package,
    children: [
      { name: "All Products", href: ROUTES.PRODUCTS },
      { name: "Categories", href: ROUTES.CATEGORIES },
      { name: "Add Product", href: ROUTES.PRODUCT_CREATE },
    ],
  },
  {
    name: "Tags",
    href: ROUTES.TAGS,
    icon: Tags,
  },
  {
    name: "Orders",
    href: ROUTES.ORDERS,
    icon: ShoppingCart,
  },
  // Trong mảng navigation của Sidebar.tsx, thêm:
  {
    name: "Anime Series",
    href: ROUTES.ANIME_SERIES,
    icon: Film,
    children: [
      { name: "All Anime", href: ROUTES.ANIME_SERIES },
      { name: "Add Anime", href: ROUTES.ANIME_SERIES_CREATE },
    ],
  },
  {
    name: "Blog",
    href: ROUTES.BLOG_POSTS,
    icon: FileText,
    children: [
      { name: "All Posts", href: ROUTES.BLOG_POSTS },
      { name: "Create Post", href: ROUTES.BLOG_POST_CREATE },
      { name: "Post Categories", href: ROUTES.POST_CATEGORIES },
    ],
  },
  {
    name: "Events",
    href: ROUTES.EVENTS,
    icon: Calendar,
    children: [
      { name: "All Events", href: ROUTES.EVENTS },
      { name: "Create Event", href: ROUTES.EVENT_CREATE },
    ],
  },
  {
    name: "Home Images",
    href: ROUTES.HOME_IMAGES,
    icon: ImageIcon,
    children: [
      { name: "All Images", href: ROUTES.HOME_IMAGES },
      { name: "Add New", href: ROUTES.HOME_IMAGE_CREATE },
    ],
  },
  {
    name: "Marketing",
    href: ROUTES.MARKETING,
    icon: BadgePercent,
    children: [
      { name: "Coupons", href: ROUTES.COUPONS, icon: Ticket },
      { name: "Badges", href: ROUTES.BADGES, icon: Badge },
    ],
  },
  {
    name: "Payment Methods",
    href: ROUTES.PAYMENT_METHODS,
    icon: CreditCard,
    children: [
      { name: "All Methods", href: ROUTES.PAYMENT_METHODS },
      { name: "Add Method", href: ROUTES.PAYMENT_METHOD_CREATE },
    ],
  },
  {
    name: "Shipping Methods",
    href: ROUTES.SHIPPING_METHODS,
    icon: Truck,
    children: [
      { name: "All Methods", href: ROUTES.SHIPPING_METHODS },
      { name: "Add Method", href: ROUTES.SHIPPING_METHOD_CREATE },
      { name: "GHN Webhook Simulator", href: ROUTES.WEBHOOK_SIMULATOR },
    ],
  },
  {
    name: "Reports",
    href: ROUTES.REPORTS,
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (name: string) => {
    if (collapsed) return // Không mở submenu khi đã collapsed
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  // Width động: collapsed thì 64px (~16), mở rộng thì 256px (w-64)
  const sidebarWidth = collapsed ? "w-16" : "w-64"

  // Thay toàn bộ phần return của Sidebar bằng đoạn này:

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        "bg-hsl(var(--sidebar-background)) text-hsl(var(--sidebar-foreground)) border-hsl(var(--sidebar-border))",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "space-x-3")}>
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Tags className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg">NekoVi CMS</span>}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const hasChildren = !!item.children?.length
            const isExpanded = expandedItems.includes(item.name)
            const isActiveItem = isActive(item.href)

            const buttonContent = (
              <div className="flex items-center w-full">
                <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                    {hasChildren && (
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
                      />
                    )}
                  </>
                )}
              </div>
            )

            return (
              <div key={item.name}>
                <Button
                  variant={isActiveItem ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    collapsed && "px-2"
                  )}
                  onClick={() => hasChildren && !collapsed && toggleExpanded(item.name)}
                  asChild={!hasChildren}
                >
                  {hasChildren ? (
                    buttonContent
                  ) : (
                    <Link href={item.href}>{buttonContent}</Link>
                  )}
                </Button>

                {/* Submenu - chỉ hiện khi mở rộng và không collapsed */}
                {hasChildren && isExpanded && !collapsed && (
                  <div className="mt-1 ml-10 space-y-1 border-l border-border pl-4">
                    {item.children!.map((child) => {
                      const ChildIcon = (child as any).icon
                      return (
                        <Button
                          key={child.href}
                          variant={isActive(child.href) ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-sm font-medium"
                          asChild
                        >
                          <Link href={child.href} className="flex items-center gap-2">
                            {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                            <span>{child.name}</span>
                          </Link>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}