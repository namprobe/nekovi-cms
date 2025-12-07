// src/entities/orders/api/order-api.ts
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { ApiResult, PaginateResult } from "@/shared/types/common"
import type { OrderDto, OrderListItem, OrderFilterParams } from "../types/order"

export interface ShippingHistoryDto {
  id: string
  orderShippingMethodId: string
  orderId: string
  trackingNumber?: string
  statusCode: number
  statusName: string
  statusDescription: string
  eventType?: string
  eventTime: string
  additionalData?: string
  callerIpAddress?: string
  createdAt?: string
}

export const orderApi = {
  /**
   * Get paginated list of orders with filters
   */
  getOrders: async (params?: OrderFilterParams): Promise<PaginateResult<OrderListItem>> => {
    return apiClient.paginate<OrderListItem>(env.ENDPOINTS.ORDER.LIST, params)
  },

  /**
   * Get order detail by ID
   */
  getOrderById: async (id: string): Promise<ApiResult<OrderDto>> => {
    return apiClient.get<OrderDto>(env.ENDPOINTS.ORDER.DETAIL(id))
  },

  /**
   * Get shipping history for an order
   */
  getShippingHistory: async (orderId: string): Promise<ApiResult<ShippingHistoryDto[]>> => {
    return apiClient.get<ShippingHistoryDto[]>(env.ENDPOINTS.ORDER.SHIPPING_HISTORY(orderId))
  },

  /**
   * Export orders to Excel/CSV
   */
  exportOrders: async (params?: OrderFilterParams): Promise<ApiResult<Blob>> => {
    // Implementation will depend on backend export endpoint
    return apiClient.get<Blob>(env.ENDPOINTS.ORDER.EXPORT, {
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  },
}

