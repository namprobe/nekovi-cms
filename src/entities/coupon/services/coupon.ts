// src/entities/coupons/services/coupon.ts
import { apiClient } from "@/core/lib/api-client"
import type { Coupon } from "../types/coupon"
import { ApiResult } from "@/shared/types/common"

// ✅ Thêm interface cho CreateCouponRequest (PascalCase for C# backend)
export interface CreateCouponRequest {
  Code: string
  Description?: string
  DiscountType: number
  DiscountValue: number
  MaxDiscountCap?: number | null
  MinOrderAmount: number
  StartDate: string
  EndDate: string
  UsageLimit?: number
  Status: number
}

export interface UpdateCouponRequest {
  Code: string
  Description?: string
  DiscountType: number
  DiscountValue: number
  MaxDiscountCap?: number | null
  MinOrderAmount: number
  StartDate: string
  EndDate: string
  UsageLimit?: number
  Status: number
}

export const couponService = {
  async getCoupons(params: { page?: number; limit?: number; search?: string }) {
    return apiClient.paginate<Coupon>("/coupons", params)
  },

  async getCouponById(id: string) {
    return apiClient.get<Coupon>(`/coupons/${id}`)
  },

  // ✅ SỬA: Dùng JSON thay vì FormData
  createCoupon: (data: CreateCouponRequest) =>
    apiClient.post<ApiResult<any>>("/coupons", data),

  // ✅ SỬA: Dùng JSON thay vì FormData
  updateCoupon: (id: string, data: UpdateCouponRequest) =>
    apiClient.put<ApiResult<any>>(`/coupons/${id}`, data),

  async deleteCoupon(id: string) {
    return apiClient.delete<void>(`/coupons/${id}`)
  }
}