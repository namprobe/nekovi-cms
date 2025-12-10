// src/features/orders/components/order-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { ShoppingCart, Clock, Package, CheckCircle, DollarSign, TrendingUp } from "lucide-react"

interface OrderStatsProps {
  totalOrders?: number
  pendingOrders?: number
  processingOrders?: number
  completedOrders?: number
  totalRevenue?: number
  avgOrderValue?: number
}

export function OrderStats({
  totalOrders = 0,
  pendingOrders = 0,
  processingOrders = 0,
  completedOrders = 0,
  totalRevenue = 0,
  avgOrderValue = 0,
}: OrderStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Pending Payment",
      value: pendingOrders.toString(),
      change: pendingOrders > 50 ? "+8%" : "-15%",
      changeType: pendingOrders > 50 ? "positive" : "negative",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Processing",
      value: processingOrders.toString(),
      change: "+22%",
      changeType: "positive" as const,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Completed",
      value: completedOrders.toLocaleString(),
      change: "+18%",
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: "+25%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Average Order Value",
      value: formatPrice(avgOrderValue),
      change: avgOrderValue > 1000000 ? "+7%" : "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
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
                      ? "text-green-600 border-green-300 bg-green-50"
                      : "text-red-600 border-red-300 bg-red-50"
                  }
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  compared to last month
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
