// src/entities/anime-series/services/anime-series-service.ts
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { AnimeSeriesItem, AnimeSeriesSelectItem, AnimeSeriesListParams } from "../types/anime-series"
import type { PaginateResult } from "@/shared/types/common"

const API = env.ENDPOINTS.ANIME_SERIES

export const animeSeriesService = {
    getList: async (params: AnimeSeriesListParams) => {
        return apiClient.paginate<AnimeSeriesItem>(API.LIST, params as unknown as any)
    },

    getById: async (id: string) => {
        return apiClient.get<AnimeSeriesItem>(API.DETAIL(id))
    },

    create: async (data: FormData) => {
        return apiClient.postFormData(API.CREATE, data)
    },

    update: async (id: string, data: FormData) => {
        return apiClient.putFormData(API.UPDATE(id), data)
    },

    delete: async (id: string) => {
        return apiClient.delete(API.DELETE(id))
    },

    getSelectList: async (search?: string) => {
        const url = API.SELECT_LIST + (search ? `?search=${encodeURIComponent(search)}` : "")
        return apiClient.get<AnimeSeriesSelectItem[]>(url)
    },
}