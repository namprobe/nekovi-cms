export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Dashboard routes
  DASHBOARD: "/dashboard",

  // User management
  USERS: "/dashboard/users",
  USER_DETAIL: (id: string) => `/dashboard/users/${id}`,
  USER_CREATE: "/dashboard/users/create",

  // Product management
  PRODUCTS: "/dashboard/products",
  PRODUCT_DETAIL: (id: string) => `/dashboard/products/${id}`,
  PRODUCT_EDIT: (id: string) => `/dashboard/products/${id}/edit`,
  PRODUCT_CREATE: "/dashboard/products/create",
  CATEGORIES: "/dashboard/categories",

  // Order management
  ORDERS: "/dashboard/orders",
  ORDER_DETAIL: (id: string) => `/dashboard/orders/${id}`,

  // Blog management
  BLOG_POSTS: "/dashboard/blog",
  BLOG_POST_DETAIL: (id: string) => `/dashboard/blog/${id}`,
  BLOG_POST_CREATE: "/dashboard/blog/create",

  // Event management
  EVENTS: "/dashboard/events",
  EVENT_DETAIL: (id: string) => `/dashboard/events/${id}`,
  EVENT_EDIT: (id: string) => `/dashboard/events/${id}/edit`,
  EVENT_CREATE: "/dashboard/events/create",

  // Marketing
  MARKETING: "/dashboard/marketing",
  COUPONS: "/dashboard/marketing/coupons",
  COUPON_DETAIL: (id: string) => `/dashboard/marketing/coupons/${id}`,
  COUPON_CREATE: "/dashboard/marketing/coupons/create",
  BADGES: "/dashboard/marketing/badges",
  BADGE_DETAIL: (id: string) => `/dashboard/marketing/badges/${id}`,
  BADGE_CREATE: "/dashboard/marketing/badges/create",

  // Reports
  REPORTS: "/dashboard/reports",

  // Settings
  SETTINGS: "/dashboard/settings",
  PROFILE: "/dashboard/profile",
} as const

export const API_ROUTES = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id: string) => `/api/users/${id}`,

  // Products
  PRODUCTS: "/api/products",
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  CATEGORIES: "/api/categories",
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,

  // Orders
  ORDERS: "/api/orders",
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,

  // Blog
  BLOG_POSTS: "/api/blog/posts",
  BLOG_POST_BY_ID: (id: string) => `/api/blog/posts/${id}`,
  POST_CATEGORIES: "/api/blog/categories",

  // Events
  EVENTS: "/api/events",
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,

  // Marketing
  COUPONS: "/api/marketing/coupons",
  COUPON_BY_ID: (id: string) => `/api/marketing/coupons/${id}`,
  BADGES: "/api/marketing/badges",
  BADGE_BY_ID: (id: string) => `/api/marketing/badges/${id}`,

  // Reports
  DASHBOARD_STATS: "/api/reports/dashboard",
  SALES_REPORT: "/api/reports/sales",
  USER_REPORT: "/api/reports/users",
} as const
