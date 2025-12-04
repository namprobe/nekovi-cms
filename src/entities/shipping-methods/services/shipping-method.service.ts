// src/entities/shipping-methods/services/shipping-method.service.ts
import { apiClient } from "@/core/lib/api-client"
import { API_ROUTES } from "@/core/config/routes"
import type {
  ShippingMethodListItem,
  ShippingMethodResponse,
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
} from "../types/shipping-method"
import type { ApiResult } from "@/shared/types/common"

export const shippingMethodService = {
  async getShippingMethods(params: {
    page?: number
    limit?: number
    search?: string
    minCost?: number
    maxCost?: number
    minEstimatedDays?: number
    maxEstimatedDays?: number
  }) {
    return apiClient.paginate<ShippingMethodListItem>(API_ROUTES.SHIPPING_METHODS, params)
  },

  getShippingMethodById: (id: string) =>
    apiClient.get<ShippingMethodResponse>(API_ROUTES.SHIPPING_METHOD_BY_ID(id)),

  createShippingMethod: (data: CreateShippingMethodDto) =>
    apiClient.post<any>(API_ROUTES.SHIPPING_METHODS, data),

  updateShippingMethod: (id: string, data: UpdateShippingMethodDto) =>
    apiClient.put<any>(API_ROUTES.SHIPPING_METHOD_BY_ID(id), data),

  deleteShippingMethod: (id: string) =>
    apiClient.delete<any>(API_ROUTES.SHIPPING_METHOD_BY_ID(id)),
}
