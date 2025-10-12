import type { BaseEntity } from "@/shared/types/common"


export interface Coupon extends BaseEntity {
    

 code : string
 description?: string
    discountType: number // 1: Percentage, 2: FixedAmount
    discountValue: number
    minOrderAmount: number
    startDate: string
    endDate: string
    usageLimit?: number
    currentUsage: number
    status: number // 1: active, 0: inactive, 2: expired
 
 // navigation properties
}

