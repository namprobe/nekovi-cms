// src/entities/product/services/product.ts
import { apiClient } from "@/core/lib/api-client"
import type {
    Product,
    ProductListItem,
} from "@/entities/products/types/product"
import type { PaginateResult, ApiResult } from "@/shared/types/common"
import { env } from "@/core/config/env"


export const productService = {
    async getProducts(params: {
        page?: number
        limit?: number
        search?: string
        stockStatus?: "in-stock" | "low-stock" | "out-of-stock"
    }) {
        return apiClient.paginate<ProductListItem[]>("/products", params)
    },

    // Detail (returns ApiResult<Product>)
    getProductById: (id: string) =>
        apiClient.get<Product>(`/products/${id}`),

    // Create product - backend nhận [FromForm] -> gửi FormData
    createProductForm: (formData: FormData) =>
        apiClient.postFormData<ApiResult<any>>("/products", formData),

    // Update product - FormData
    updateProductForm: (id: string, formData: FormData) =>
        apiClient.putFormData<ApiResult<any>>(`/products/${id}`, formData),

    // Delete
    deleteProduct: (id: string) =>
        apiClient.delete<ApiResult<any>>(`/products/${id}`),

    getSelectList: (search?: string) => {
        const url =
            env.ENDPOINTS.PRODUCT.SELECT_LIST +
            (search ? `?search=${encodeURIComponent(search)}` : "")
        return apiClient.get<{ id: string; name: string }[]>(url)
    },
}
