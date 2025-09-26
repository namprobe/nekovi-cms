export enum Permission {
  // User management
  VIEW_USERS = "view_users",
  CREATE_USERS = "create_users",
  UPDATE_USERS = "update_users",
  DELETE_USERS = "delete_users",

  // Product management
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCTS = "create_products",
  UPDATE_PRODUCTS = "update_products",
  DELETE_PRODUCTS = "delete_products",

  // Order management
  VIEW_ORDERS = "view_orders",
  UPDATE_ORDERS = "update_orders",
  DELETE_ORDERS = "delete_orders",

  // Blog management
  VIEW_BLOG_POSTS = "view_blog_posts",
  CREATE_BLOG_POSTS = "create_blog_posts",
  UPDATE_BLOG_POSTS = "update_blog_posts",
  DELETE_BLOG_POSTS = "delete_blog_posts",

  // Event management
  VIEW_EVENTS = "view_events",
  CREATE_EVENTS = "create_events",
  UPDATE_EVENTS = "update_events",
  DELETE_EVENTS = "delete_events",

  // Reports
  VIEW_REPORTS = "view_reports",

  // System
  MANAGE_SETTINGS = "manage_settings",
  VIEW_AUDIT_LOGS = "view_audit_logs",
}

export const ROLE_PERMISSIONS = {
  SuperAdmin: Object.values(Permission),
  Admin: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDERS,
    Permission.VIEW_BLOG_POSTS,
    Permission.CREATE_BLOG_POSTS,
    Permission.UPDATE_BLOG_POSTS,
    Permission.DELETE_BLOG_POSTS,
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.DELETE_EVENTS,
    Permission.VIEW_REPORTS,
  ],
  Manager: [
    Permission.VIEW_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDERS,
    Permission.VIEW_BLOG_POSTS,
    Permission.CREATE_BLOG_POSTS,
    Permission.UPDATE_BLOG_POSTS,
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.VIEW_REPORTS,
  ],
  Staff: [
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDERS,
    Permission.VIEW_BLOG_POSTS,
    Permission.CREATE_BLOG_POSTS,
    Permission.UPDATE_BLOG_POSTS,
    Permission.VIEW_EVENTS,
  ],
} as const

export function hasPermission(userRoles: string[], permission: Permission): boolean {
  return userRoles.some((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
    return rolePermissions?.includes(permission as any) || false
  })
}

export function getRolePermissions(role: string): Permission[] {
  return [...(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [])]
}
