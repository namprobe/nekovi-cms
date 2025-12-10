// src/entities/product-inventories/types/product-inventory.ts

export enum EntityStatusEnum {
    Active = 0,
    Inactive = 1,
}

export interface ProductInventoryItem {
    id: string
    productId: string
    importer?: string
    quantity: number
    createdAt: string
    updatedAt?: string | null
    createdBy?: string | null
    updatedBy?: string | null
    status: EntityStatusEnum
    statusName: string
}


export interface ProductInventoryRequest {
    productId: string
    quantity: number
    status?: EntityStatusEnum // Backend có hỗ trợ, nhưng nên luôn là Active
}

export interface ProductInventoryFilter {
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    isAscending?: boolean
    status?: EntityStatusEnum
    productId?: string
}

// Kết quả phân trang từ backend
export interface ProductInventoryPaginatedResult {
    isSuccess: boolean
    items: ProductInventoryItem[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasPrevious: boolean
    hasNext: boolean
    errors?: string[]
    errorCode?: string
}