// src/entities/product-inventories/services/product-inventory.ts

import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type {
    ProductInventoryItem,
    ProductInventoryRequest,
    ProductInventoryFilter,
    ProductInventoryPaginatedResult,
} from "../types/product-inventory"
import type { ApiResult } from "@/shared/types/common"

/**
 * Product Inventory Service
 * Dùng env.ENDPOINTS để đảm bảo đồng bộ 100% với cấu hình API
 */
export const productInventoryService = {
    /** Lấy danh sách phiếu nhập kho (có phân trang + lọc) */
    getList: (filter: ProductInventoryFilter = {}): Promise<ProductInventoryPaginatedResult> => {
        const query = new URLSearchParams()

        // Pagination
        query.append("page", (filter.page || 1).toString())
        query.append("pageSize", (filter.pageSize || 10).toString())

        // Filters
        if (filter.search) query.append("search", filter.search)
        if (filter.sortBy) query.append("sortBy", filter.sortBy)
        if (filter.isAscending !== undefined) query.append("isAscending", filter.isAscending.toString())
        if (filter.status !== undefined) query.append("status", filter.status.toString())
        if (filter.productId) query.append("productId", filter.productId)

        const url = `${env.ENDPOINTS.PRODUCT_INVENTORY.LIST}?${query.toString()}`
        return apiClient.paginate<ProductInventoryItem>(url)
    },

    /** Lấy chi tiết một phiếu nhập kho */
    getById: (id: string): Promise<ApiResult<ProductInventoryItem>> => {
        return apiClient.get<ProductInventoryItem>(env.ENDPOINTS.PRODUCT_INVENTORY.DETAIL(id))
    },

    /** Tạo mới phiếu nhập kho */
    create: (data: ProductInventoryRequest): Promise<ApiResult<null>> => {
        const formData = new FormData()
        formData.append("productId", data.productId)
        formData.append("quantity", data.quantity.toString())
        if (data.status !== undefined) {
            formData.append("status", data.status.toString())
        }

        return apiClient.postFormData<null>(env.ENDPOINTS.PRODUCT_INVENTORY.CREATE, formData)
    },

    /** Cập nhật phiếu nhập kho */
    update: (id: string, data: ProductInventoryRequest): Promise<ApiResult<null>> => {
        const formData = new FormData()
        formData.append("productId", data.productId)
        formData.append("quantity", data.quantity.toString())
        if (data.status !== undefined) {
            formData.append("status", data.status.toString())
        }

        return apiClient.putFormData<null>(env.ENDPOINTS.PRODUCT_INVENTORY.UPDATE(id), formData)
    },

    /** Xóa mềm phiếu nhập kho */
    delete: (id: string): Promise<ApiResult<null>> => {
        return apiClient.delete<null>(env.ENDPOINTS.PRODUCT_INVENTORY.DELETE(id))
    },

    /** Lấy lịch sử nhập kho của một sản phẩm cụ thể */
    getHistoryByProductId: (
        productId: string,
        filter: Omit<ProductInventoryFilter, "productId"> = {}
    ): Promise<ProductInventoryPaginatedResult> => {
        return productInventoryService.getList({ ...filter, productId })
    },
}