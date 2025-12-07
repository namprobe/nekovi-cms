
//src/entities/event/types/event.ts
import { apiClient } from "@/core/lib/api-client"
import type { PaginateResult } from "@/shared/types/common"
import { env } from "@/core/config/env"
import type {
    EventListItem,
    CreateEventDto,
    UpdateEventDto,
    PaginatedEventList
} from "../types/event"

/**
 * eventService - wrapper cho tất cả endpoint /events
 */
export const eventService = {
    /**
     * Lấy danh sách event có phân trang + filter
     * @param params search, status, page, pageSize
     */
    getEvents: (params?: { search?: string; status?: "all" | "active" | "inactive"; page?: number; pageSize?: number }) => {
        const query = new URLSearchParams()
        if (params?.search) query.append("search", params.search)
        if (params?.status) query.append("status", params.status)
        if (params?.page) query.append("page", params.page.toString())
        if (params?.pageSize) query.append("pageSize", params.pageSize.toString())

        return apiClient.get<PaginateResult<EventListItem>>(`${env.ENDPOINTS.EVENT.LIST}?${query.toString()}`)
    },

    /**
     * Chi tiết 1 event theo id
     */
    getEventById: (id: string) =>
        apiClient.get<EventListItem>(env.ENDPOINTS.EVENT.DETAIL(id)),

    /**
     * Tạo event mới (FormData vì có thể upload ảnh)
     */
    createEventForm: (formData: FormData) =>
        apiClient.postFormData(`/events`, formData),

    /**
     * Update event (FormData)
     */
    updateEventForm: (id: string, formData: FormData) =>
        apiClient.putFormData(`/events/${id}`, formData),

    /**
     * Xóa event
     */
    deleteEvent: (id: string) =>
        apiClient.delete(`/events/${id}`)
}
