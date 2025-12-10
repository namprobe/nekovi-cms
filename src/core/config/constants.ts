export const APP_CONFIG = {
  APP_NAME: "NekoVi CMS",
  APP_DESCRIPTION: "Content Management System for NekoVi Ecommerce",
  VERSION: "1.0.0",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // API
  API_TIMEOUT: 30000, // 30 seconds
} as const

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[1-9][\d]{0,15}$/,
} as const

export const STATUS_VARIANTS = {
  [1]: "success" as const, // Active
  [0]: "error" as const, // Inactive
  [2]: "warning" as const, // Pending
  [3]: "neutral" as const, // Archived
} as const

export const ORDER_STATUS_VARIANTS = {
  [1]: "warning" as const, // Pending
  [2]: "info" as const, // Processing
  [3]: "secondary" as const, // Shipped
  [4]: "success" as const, // Delivered
  [5]: "error" as const, // Cancelled
  [6]: "warning" as const, // Returned
} as const

export const PAYMENT_STATUS_VARIANTS = {
  [1]: "warning" as const, // Pending
  [2]: "success" as const, // Completed
  [3]: "error" as const, // Failed
  [4]: "info" as const, // Refunded
  [5]: "neutral" as const, // Cancelled
} as const

// Legacy support - can be removed later
export const STATUS_COLORS = STATUS_VARIANTS
export const ORDER_STATUS_COLORS = ORDER_STATUS_VARIANTS
export const PAYMENT_STATUS_COLORS = PAYMENT_STATUS_VARIANTS
