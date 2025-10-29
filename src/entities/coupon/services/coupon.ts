// src/entities/coupons/services/coupon.ts
import { apiClient } from "@/core/lib/api-client"
import type { Coupon } from "../types/coupon"
import { ApiResult } from "@/shared/types/common"

// ✅ Thêm interface cho CreateCouponRequest
export interface CreateCouponRequest {
  code: string
  description?: string
  discountType: number
  discountValue: number
  minOrderAmount: number
  startDate: string
  endDate: string
  usageLimit?: number
  status: number
}

export interface UpdateCouponRequest {
  code: string
  description?: string
  discountType: number
  discountValue: number
  minOrderAmount: number
  startDate: string
  endDate: string
  usageLimit?: number
  status: number
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