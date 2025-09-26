"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { ShoppingCart, Clock, Package, CheckCircle, DollarSign, TrendingUp } from "lucide-react"

interface OrderStatsProps {
  stats?: {
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    completedOrders: number
    totalRevenue: number
    averageOrderValue: number
  }
}

// Mock data - replace with actual API call
const mockStats = {
  totalOrders: 1247,
  pendingOrders: 23,
  processingOrders: 45,
  completedOrders: 1179,
  totalRevenue: 89750.5,
  averageOrderValue: 72.15,
}

export function OrderStats({ stats = mockStats }: OrderStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      change: "-5%",
      changeType: "negative" as const,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Processing",
      value: stats.processingOrders.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Completed",
      value: stats.completedOrders.toLocaleString(),
      change: "+15%",
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Avg Order Value",
      value: formatPrice(stats.averageOrderValue),
      change: "+3%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <Badge
                  variant="outline"
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600 border-green-200 bg-green-50"
                      : "text-red-600 border-red-200 bg-red-50"
                  }
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
