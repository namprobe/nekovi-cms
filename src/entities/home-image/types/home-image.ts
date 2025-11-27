// src/entities/home-image/types/home-image.ts
import type { BaseEntity } from "@/shared/types/common"

export interface HomeImage extends BaseEntity {
    name: string
    imagePath: string
    animeSeriesId?: string
    animeSeriesName?: string
}

export interface HomeImageListItem {
    id: string
    name: string
    imagePath: string
    animeSeriesId?: string
    animeSeriesName?: string | null
    createdAt: string
    status: number
}

export interface CreateHomeImageDto {
    name: string
    imageFile: File
    animeSeriesId?: string
}

export interface UpdateHomeImageDto {
    name: string
    imageFile?: File
    animeSeriesId?: string | null
}

export interface HomeImageFilter {
    search?: string
    animeSeriesId?: string
    hasAnimeSeries?: boolean
    page?: number
    pageSize?: number
}

export interface PaginatedHomeImageList {
    items: HomeImageListItem[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
}