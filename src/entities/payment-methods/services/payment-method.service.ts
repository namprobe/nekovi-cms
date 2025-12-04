// src/entities/payment-methods/services/payment-method.service.ts
import { apiClient } from "@/core/lib/api-client"
import { API_ROUTES } from "@/core/config/routes"
import type {
  PaymentMethodListItem,
  PaymentMethodResponse,
} from "../types/payment-method"
import type { ApiResult } from "@/shared/types/common"

export const paymentMethodService = {
  async getPaymentMethods(params: {
    page?: number
    limit?: number
    search?: string
    isOnlinePayment?: boolean
    minProcessingFee?: number
    maxProcessingFee?: number
  }) {
    return apiClient.paginate<PaymentMethodListItem>(API_ROUTES.PAYMENT_METHODS, params)
  },

  getPaymentMethodById: (id: string) =>
    apiClient.get<PaymentMethodResponse>(API_ROUTES.PAYMENT_METHOD_BY_ID(id)),

  createPaymentMethod: (formData: FormData) =>
    apiClient.postFormData<any>(API_ROUTES.PAYMENT_METHODS, formData),

  updatePaymentMethod: (id: string, formData: FormData) =>
    apiClient.putFormData<any>(API_ROUTES.PAYMENT_METHOD_BY_ID(id), formData),

  deletePaymentMethod: (id: string) =>
    apiClient.delete<any>(API_ROUTES.PAYMENT_METHOD_BY_ID(id)),
}
