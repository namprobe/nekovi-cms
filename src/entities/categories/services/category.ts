//src/entities/categories/services/category.ts
import { apiClient } from "@/core/lib/api-client"
import type { Category } from "../types/category"
import { ApiResult } from "@/shared/types/common"

export const categoryService = {

    async getCategories(params: { page?: number; limit?: number; search?: string }) {
        return apiClient.paginate<Category>("/categories", params)
    },

    async getCategoryById(id: string) {
        return apiClient.get<Category>(`/categories/${id}`)
    },

    createCategory: (formData: FormData) =>
        apiClient.postFormData<ApiResult<any>>("/categories", formData),

    updateCategory: (id: string, formData: FormData) =>
        apiClient.putFormData<ApiResult<any>>(`/categories/${id}`, formData),

    async deleteCategory(id: string) {
        return apiClient.delete<void>(`/categories/${id}`)
    }
}
