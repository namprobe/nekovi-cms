import type { BaseEntity } from "@/shared/types/common"

/**
 * Coupon entity shared with CMS forms.
 */
export interface Coupon extends BaseEntity {
  code: string
  description?: string
  /**
   * 0: Percentage, 1: FixedAmount, 2: FreeShipping
   */
  discountType: number
  discountValue: number
  maxDiscountCap?: number | null
  minOrderAmount: number
  startDate: string
  endDate: string
  usageLimit?: number
  currentUsage: number
  /**
   * 1: active, 0: inactive, 2: expired
   */
  status: number
}


