// src/entities/post-category/post-category.service.ts
import { cmsApiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import { SelectOption } from "@/shared/types/select"

interface PostCategorySelectItemDto {
    id: string
    name: string
}

export const postCategoryService = {
    getSelectList: async (search?: string): Promise<SelectOption[]> => {
        const result = await cmsApiClient.get<PostCategorySelectItemDto[]>(
            `${env.ENDPOINTS.POST_CATEGORY.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ""}`
        )

        if (!result.isSuccess || !result.data) return []

        return result.data.map(item => ({
            id: item.id,
            label: item.name
        }))
    },
}