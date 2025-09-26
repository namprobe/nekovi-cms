import type { BaseEntity, ConditionType, DiscountType } from "./common"

export interface Event extends BaseEntity {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  imagePath?: string
  eventProducts?: EventProduct[]
}

export interface EventProduct extends BaseEntity {
  eventId: string
  productId: string
  isFeatured: boolean
  discountPercentage: number
  event?: Event
  product?: {
    id: string
    name: string
    price: number
    discountPrice?: number
  }
}

export interface Badge extends BaseEntity {
  name: string
  description?: string
  iconPath?: string
  discountPercentage: number
  conditionType: ConditionType
  conditionValue: string
  isTimeLimited: boolean
  startDate?: Date
  endDate?: Date
  userBadges?: UserBadge[]
}

export interface UserBadge extends BaseEntity {
  userId: string
  badgeId: string
  earnedDate: Date
  isActive: boolean
  activatedFrom?: Date
  activatedTo?: Date
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  badge?: Badge
}

export interface Coupon extends BaseEntity {
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  startDate: Date
  endDate: Date
  usageLimit?: number
  currentUsage: number
  userCoupons?: UserCoupon[]
}

export interface UserCoupon extends BaseEntity {
  userId?: string
  couponId: string
  orderId?: string
  usedDate?: Date
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  coupon?: Coupon
  order?: {
    id: string
    orderNumber: string
    totalAmount: number
    status: number
  }
}

// DTOs
export interface CreateEventDto {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  imagePath?: string
  featuredProducts: {
    productId: string
    discountPercentage: number
  }[]
}

export interface CreateCouponDto {
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  startDate: Date
  endDate: Date
  usageLimit?: number
}
