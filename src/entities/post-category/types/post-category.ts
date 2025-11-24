// src/entities/post-category/types/post-category.ts
export interface PostCategoryItem {
    id: string
    name: string
    description?: string
    status: number
    createdAt: string
    updatedAt?: string
}

export interface PostCategoryRequest {
    name: string
    description?: string
    status: number
}