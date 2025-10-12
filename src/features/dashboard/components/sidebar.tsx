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
  icons,
  Ticket,
  Badge,
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
    name: "Orders",
    href: ROUTES.ORDERS,
    icon: ShoppingCart,
  },
  {
    name: "Blog",
    href: ROUTES.BLOG_POSTS,
    icon: FileText,
    children: [
      { name: "All Posts", href: ROUTES.BLOG_POSTS },
      { name: "Create Post", href: ROUTES.BLOG_POST_CREATE },
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
    name: "Marketing",
    href: ROUTES.MARKETING,
    icon: Tags,
    children: [
      { name: "Coupons", href: ROUTES.COUPONS, icon: Ticket },
      { name: "Badges", href: ROUTES.BADGES, icon: Badge },
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
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className={cn("flex flex-col h-full", className)} style={{
      backgroundColor: "hsl(var(--sidebar-background))",
      color: "hsl(var(--sidebar-foreground))",
      borderRight: "1px solid hsl(var(--sidebar-border))"
    }}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Tags className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Anime CMS</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.name)
            const itemIsActive = isActive(item.href)

            return (
              <div key={item.name}>
                <Button
                  variant={itemIsActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2",
                    itemIsActive && "bg-accent text-accent-foreground",
                  )}
                  asChild={!hasChildren}
                  onClick={hasChildren ? () => toggleExpanded(item.name) : undefined}
                >
                  {hasChildren ? (
                    <div className="flex items-center w-full">
                      <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronRight
                            className={cn("h-4 w-4 transition-transform", isExpanded && "transform rotate-90")}
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex items-center w-full">
                      <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )}
                </Button>

                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {/* {item.children?.map((child) => (
                      <Button
                        key={child.href}
                        variant={isActive(child.href) ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm",
                          isActive(child.href) && "bg-accent text-accent-foreground",
                        )}
                        asChild
                      >
                        <Link href={child.href}>{child.name}</Link>
                      </Button>
                    ))} */}
                    {item.children?.map((child) => {
                      const ChildIcon = (child as any).icon
                      return (
                        <Button
                          key={child.href}
                          variant={isActive(child.href) ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-sm",
                            isActive(child.href) && "bg-accent text-accent-foreground",
                          )}
                          asChild
                        >
                          <Link href={child.href} className="flex items-center">
                            {ChildIcon && <ChildIcon className="h-3 w-3 mr-2" />}
                            {child.name}
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
