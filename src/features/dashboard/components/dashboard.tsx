// src/features/dashboard/components/dashboard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Users, Package, ShoppingCart, TrendingUp, Clock, Loader2 } from "lucide-react"
import { dashboardService } from "@/entities/dashboard/services/dashboard"
import { format } from "date-fns"
import { ROUTES } from "@/core/config/routes"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { DashboardData } from "@/entities/dashboard/types/dashboard"

// Import awesome OrderStats component
import { OrderStats } from "@/features/orders/components/order-stats"

// Helpers
const formatPrice = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    return format(new Date(date), "dd/MM/yyyy HH:mm")
}

export function Dashboard() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await dashboardService.getDashboardData()

                if (result.isSuccess && result.data) {
                    setDashboard(result.data)
                } else {
                    setError(result.message || "Failed to load dashboard data")
                }
            } catch (err: any) {
                setError("Server connection error")
                console.error("Dashboard error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading...</span>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
                <p className="text-xl font-semibold">Failed to load</p>
                <p className="mt-2">{error}</p>
            </div>
        )
    }

    // Main stats cards
    const mainStats = [
        {
            title: "Total Users",
            value: dashboard?.totalUsers?.toLocaleString() ?? "0",
            change: dashboard?.newUsersChangePercent ?? 0,
            icon: Users,
            color: "text-blue-600",
            href: ROUTES.USERS,
        },
        {
            title: "Products",
            value: dashboard?.totalProducts?.toLocaleString() ?? "0",
            change: dashboard?.newProductsChangePercent ?? 0,
            icon: Package,
            color: "text-green-600",
            href: ROUTES.PRODUCTS,
        },
        {
            title: "Orders This Month",
            value: dashboard?.ordersThisMonth?.toLocaleString() ?? "0",
            change: dashboard?.ordersChangePercent ?? 0,
            icon: ShoppingCart,
            color: "text-purple-600",
            href: ROUTES.ORDERS,
        },
        {
            title: "Revenue This Month",
            value: dashboard?.revenueThisMonth ? formatPrice(dashboard.revenueThisMonth) : "0 ₫",
            change: dashboard?.revenueChangePercent ?? 0,
            icon: TrendingUp,
            color: "text-emerald-600",
            href: ROUTES.ORDERS,
        },
    ]

    return (
        <>
            {/* ORDER STATS SECTION */}
            <OrderStats
                totalOrders={dashboard?.totalOrders ?? 0}
                pendingOrders={dashboard?.pendingOrders ?? 0}
                processingOrders={dashboard?.processingOrders ?? 0}
                completedOrders={dashboard?.completedOrders ?? 0}
                totalRevenue={dashboard?.totalRevenue ?? 0}
                avgOrderValue={dashboard?.avgOrderValue ?? 0}
            />

            {/* 4 MAIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {mainStats.map((stat) => {
                    const Icon = stat.icon
                    const isPositive = stat.change >= 0
                    return (
                        <Link href={stat.href} key={stat.title} className="block">
                            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-primary/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    {stat.change !== 0 && (
                                        <p
                                            className={`text-sm flex items-center mt-2 font-medium ${isPositive ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive ? "rotate-180" : ""}`} />
                                            {isPositive ? "+" : ""}
                                            {Math.abs(stat.change).toFixed(1)}% from last month
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* RECENT ACTIVITY + QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Activity */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Clock className="w-6 h-6" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {!dashboard?.recentActivities || dashboard.recentActivities.length === 0 ? (
                                <p className="text-center text-muted-foreground py-12 text-lg">
                                    No activity yet
                                </p>
                            ) : (
                                dashboard.recentActivities.slice(0, 8).map((act, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${act.type.includes("order")
                                                ? "bg-blue-500"
                                                : act.type.includes("user")
                                                    ? "bg-purple-500"
                                                    : act.type.includes("low-stock")
                                                        ? "bg-yellow-500"
                                                        : "bg-green-500"
                                                }`}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{act.message}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatTimeAgo(act.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { href: ROUTES.USER_CREATE, icon: Users, color: "text-blue-600", label: "Add User" },
                                { href: ROUTES.PRODUCT_CREATE, icon: Package, color: "text-green-600", label: "Add Product" },
                                { href: ROUTES.ORDERS, icon: ShoppingCart, color: "text-purple-600", label: "View Orders" },
                                { href: ROUTES.REPORTS, icon: TrendingUp, color: "text-orange-600", label: "Reports" },
                            ].map((action) => {
                                const Icon = action.icon
                                return (
                                    <Link href={action.href} key={action.label}>
                                        <button className="w-full p-6 border-2 border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all group">
                                            <Icon className={`h-10 w-10 ${action.color} mb-3 mx-auto group-hover:scale-110 transition-transform`} />
                                            <p className="font-semibold text-foreground">{action.label}</p>
                                        </button>
                                    </Link>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
