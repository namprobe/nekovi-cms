// src/entities/reports/types/report.ts

export interface RevenueSummary {
    currentMonth: number
    previousMonth: number
    percentageChange: number
    isPositive: boolean
}

export interface OrderSummary {
    currentMonth: number
    previousMonth: number
    percentageChange: number
    isPositive: boolean
}

export interface UserSummary {
    totalUser: number
    currentMonth: number
    previousMonth: number
    percentageChange: number
    isPositive: boolean
}

export interface RecentActivityItem {
    title: string
    description: string
    timeAgo: string
    color: string // "blue" | "green" | "yellow"
}

export interface DashboardSummaryResponse {
    revenue: RevenueSummary
    orders: OrderSummary
    activeUsers: UserSummary
    recentActivities: RecentActivityItem[]
}