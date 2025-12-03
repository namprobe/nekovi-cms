// src/features/reports/components/report-dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import {
    BarChart3,
    Users,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from "lucide-react"
import { reportService } from "@/entities/reports/services/report"
import type { DashboardSummaryResponse } from "@/entities/reports/types/report"
import { cn } from "@/core/lib/utils" // Giả sử bạn có utility này, hoặc dùng clsx

export function ReportDashboard() {
    const [data, setData] = useState<DashboardSummaryResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await reportService.getDashboardSummary()

                if (result.isSuccess && result.data) {
                    setData(result.data)
                } else {
                    setError(result.message || "Failed to fetch dashboard data")
                }
            } catch (err) {
                setError("An unexpected error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return <DashboardSkeleton />
    }

    if (error) {
        return <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">{error}</div>
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Revenue Card */}
                <StatCard
                    title="Total Revenue This Month"
                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    value={formatCurrency(data.revenue.currentMonth)}
                    percentage={data.revenue.percentageChange}
                    isPositive={data.revenue.isPositive}
                />

                {/* Orders Card */}
                <StatCard
                    title="Orders This Month"
                    icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                    value={data.orders.currentMonth.toLocaleString()}
                    percentage={data.orders.percentageChange}
                    isPositive={data.orders.isPositive}
                />

                {/* Active Users Card */}
                <StatCard
                    title="Active Users"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    value={data.activeUsers.totalUser.toLocaleString()}
                    percentage={data.activeUsers.percentageChange}
                    isPositive={data.activeUsers.isPositive}
                />
            </div>

            {/* Recent Activity Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {data.recentActivities.length > 0 ? (
                            data.recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center">
                                    <span className={cn(
                                        "relative flex h-3 w-3 mr-4 rounded-full",
                                        getColorClass(activity.color)
                                    )}>
                                        <span className={cn(
                                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                            getColorClass(activity.color)
                                        )}></span>
                                    </span>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {activity.timeAgo}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-4">
                                No recent activities found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Helper Components & Functions ---

function StatCard({
    title,
    icon,
    value,
    percentage,
    isPositive
}: {
    title: string;
    icon: React.ReactNode;
    value: string | number;
    percentage: number;
    isPositive: boolean
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {isPositive ? (
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                        {Math.abs(percentage)}%
                    </span>
                    <span className="ml-1">from last month</span>
                </div>
            </CardContent>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader><div className="h-6 w-32 bg-gray-200 rounded animate-pulse" /></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 w-full bg-gray-100 rounded animate-pulse" />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount)
}

function getColorClass(color: string) {
    switch (color.toLowerCase()) {
        case 'blue': return "bg-blue-500"
        case 'green': return "bg-green-500"
        case 'yellow': return "bg-yellow-500"
        case 'red': return "bg-red-500"
        default: return "bg-gray-500"
    }
}