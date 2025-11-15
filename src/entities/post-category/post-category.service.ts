// src/entities/post-category/post-category.service.ts
import { cmsApiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import { SelectOption } from "@/shared/types/select"
import type { PostCategoryItem } from "./types/post-category"

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

    getPostCategories: (params?: { page?: number; pageSize?: number; search?: string }) => {
        return cmsApiClient.paginate<PostCategoryItem>(env.ENDPOINTS.POST_CATEGORY.LIST, params)
    },

    getPostCategoryById: (id: string) =>
        cmsApiClient.get<PostCategoryItem>(env.ENDPOINTS.POST_CATEGORY.DETAIL(id)),

    createPostCategory: (formData: FormData) =>
        cmsApiClient.postFormData(env.ENDPOINTS.POST_CATEGORY.CREATE, formData),

    updatePostCategory: (id: string, formData: FormData) =>
        cmsApiClient.putFormData(env.ENDPOINTS.POST_CATEGORY.UPDATE(id), formData),

    deletePostCategory: (id: string) =>
        cmsApiClient.delete(env.ENDPOINTS.POST_CATEGORY.DELETE(id)),
}