// src/entities/product/services/product.ts
import { apiClient } from "@/core/lib/api-client"
import type {
    Product,
    ProductListItem,
} from "@/entities/products/types/product"
import type { PaginateResult, ApiResult } from "@/shared/types/common"

/**
 * productService - wrapper cho tất cả endpoint /products
 * NOTE:
 *  - list => apiClient.paginate("/products", params)
 *  - detail => apiClient.get("/products/{id}")
 *  - create/update with files => sử dụng postFormData / putFormData
 */

export const productService = {
    // Paginated list (params: page, limit, search, categoryId, sortBy, sortOrder...)
    // getProducts: (params?: Record<string, any>) =>
    //     apiClient.paginate<ProductListItem>("/products", params),
    async getProducts(params: { page?: number; limit?: number; search?: string }) {
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
}
