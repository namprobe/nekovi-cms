// src/entities/home-image/services/home-image.ts
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { PaginatedHomeImageList, HomeImageListItem, HomeImageFilter } from "../types/home-image"

export const homeImageService = {
    getList: (params?: HomeImageFilter) => {
        const query = new URLSearchParams()
        if (params?.search) query.append("search", params.search)
        if (params?.animeSeriesId) query.append("animeSeriesId", params.animeSeriesId)
        if (params?.hasAnimeSeries !== undefined) query.append("hasAnimeSeries", params.hasAnimeSeries.toString())
        if (params?.page) query.append("page", params.page.toString())
        if (params?.pageSize) query.append("pageSize", params.pageSize.toString())

        const url = `${env.ENDPOINTS.HOME_IMAGE.LIST}?${query.toString()}`
        return apiClient.paginate<HomeImageListItem>(url)
    },

    getById: (id: string) =>
        apiClient.get<HomeImageListItem>(env.ENDPOINTS.HOME_IMAGE.DETAIL(id)),

    create: (formData: FormData) =>
        apiClient.postFormData(env.ENDPOINTS.HOME_IMAGE.CREATE, formData),

    update: (id: string, formData: FormData) =>
        apiClient.putFormData(env.ENDPOINTS.HOME_IMAGE.UPDATE(id), formData),

    delete: (id: string) =>
        apiClient.delete(env.ENDPOINTS.HOME_IMAGE.DELETE(id)),
}