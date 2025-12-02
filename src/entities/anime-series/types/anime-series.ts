// src/entities/anime-series/types/anime-series.ts
import { EntityStatus } from "@/shared/types/common"

export interface AnimeSeriesItem {
    id: string
    title: string
    releaseYear: number
    imagePath?: string | null
    description?: string | null
    // Nên dùng number để map với Enum EntityStatus chung của hệ thống
    status: number
    createdAt: string
    updatedAt?: string | null
}

export interface AnimeSeriesSelectItem {
    id: string
    title: string
}

// Params cho API get list
export interface AnimeSeriesListParams {
    page?: number
    limit?: number
    search?: string
    releaseYear?: number
}