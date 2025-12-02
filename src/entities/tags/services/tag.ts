import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { Tag } from "../types/tag"
import type { ApiResult } from "@/shared/types/common"

export const tagService = {
    async getTags(params: { page?: number; pageSize?: number; search?: string; status?: number }) {
        return apiClient.paginate<Tag>(env.ENDPOINTS.TAG.LIST, params)
    },

    async getTag(id: string) {
        return apiClient.get<Tag>(env.ENDPOINTS.TAG.DETAIL(id))
    },

    createTag(formData: FormData) {
        return apiClient.postFormData<ApiResult<any>>(env.ENDPOINTS.TAG.CREATE, formData)
    },

    updateTag(id: string, formData: FormData) {
        return apiClient.putFormData<ApiResult<any>>(env.ENDPOINTS.TAG.UPDATE(id), formData)
    },

    deleteTag(id: string) {
        return apiClient.delete<void>(env.ENDPOINTS.TAG.DELETE(id))
    },
}