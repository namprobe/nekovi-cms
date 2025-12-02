// src/entities/dashboard/types/dashboard.ts

export interface RecentActivity {
    message: string;
    timestamp: string;
    type: string; // 'order-new' | 'order-shipping' | 'low-stock' | 'user-new'
    timeAgo: string;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
}

export interface DashboardData {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersChangePercent: number;

    totalProducts: number;
    newProductsThisMonth: number;
    newProductsChangePercent: number;

    totalOrders: number;
    ordersThisMonth: number;
    ordersChangePercent: number;

    pendingOrders: number;
    pendingThisMonth: number;
    pendingChangePercent: number;

    processingOrders: number;
    processingThisMonth: number;
    processingChangePercent: number;

    completedOrders: number;
    completedThisMonth: number;
    completedChangePercent: number;

    totalRevenue: number;
    revenueThisMonth: number;
    revenueChangePercent: number;

    avgOrderValue: number;
    avgOrderValueThisMonth: number;
    aovChangePercent: number;

    recentActivities: RecentActivity[];
    revenueChart?: DailyRevenue[]; // Nếu bạn đã thêm phần này ở BE
}