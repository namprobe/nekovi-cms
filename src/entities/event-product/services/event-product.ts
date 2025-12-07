import { cmsApiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { ApiResult } from "@/shared/types/common"
import type {
    EventProductSaveRequest,
    EventProductWithProductItem
} from "../types/event-product"

export const eventProductService = {
    // Lấy danh sách sản phẩm đã có trong event
    getByEventId: (eventId: string) => {
        const url = env.ENDPOINTS.EVENT_PRODUCT.LIST_BY_EVENT(eventId)
        return cmsApiClient.get<EventProductWithProductItem[]>(url)
    },

    // Lưu danh sách (Cập nhật toàn bộ)
    saveEventProducts: (eventId: string, data: EventProductSaveRequest[]) => {
        const url = env.ENDPOINTS.EVENT_PRODUCT.SAVE(eventId)
        return cmsApiClient.post<ApiResult>(url, data)
    }
}