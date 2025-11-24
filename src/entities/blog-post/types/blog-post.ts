// src/entities/blog-post/types/blog-post.ts
import type { BaseEntity } from "@/shared/types/common"

export interface BlogPost extends BaseEntity {
    title: string
    slug: string
    content: string
    excerpt?: string
    publishDate: Date
    isPublished: boolean
    featuredImagePath?: string
    authorId: string
    authorName?: string
    postCategoryId?: string
    postCategoryName?: string
    tags: { id: string; name: string }[]
}

export interface BlogPostListItem {
    id: string
    title: string
    authorName?: string
    authorAvatar?: string
    postCategory?: {
        id: string
        name: string
    }
    publishDate: string | Date
    isPublished: boolean
    featuredImage?: string
    status: number
    postTags: { tagId: string; tagName: string }[]
}

// src/entities/blog-post/types/blog-post.ts
export interface CreateBlogPostDto {
    id?: string  // <-- THÊM DÒNG NÀY
    title: string
    content: string
    postCategoryId?: string
    publishDate: Date
    isPublished: boolean
    featuredImageFile?: File
    tagIds?: string[]
    status?: number
}

export interface UpdateBlogPostDto {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    publishDate?: Date
    isPublished?: boolean
    featuredImage?: File
    postCategoryId?: string
    tagIds?: string[]
}

export interface BlogPostFilter {
    search?: string
    title?: string
    postCategoryId?: string
    authorId?: string
    isPublished?: boolean
    tagIds?: string[]
    status?: "all" | "active" | "inactive"
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface PaginatedBlogPostList {
    items: BlogPostListItem[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasPrevious: boolean
    hasNext: boolean
}


export interface BlogPostDetailResponse {
    id: string
    title: string
    content: string
    postCategoryId?: string
    postCategory?: {
        id: string
        name: string
        description?: string
    }
    authorId?: string
    authorName?: string
    authorAvatar?: string
    publishDate: string | Date
    isPublished: boolean
    featuredImage?: string
    status: number
    createdAt?: string
    updatedAt?: string

    // ← ĐÚNG CẤU TRÚC BE
    postTags: Array<{
        id: string
        tagId: string
        tags: Array<{
            id: string
            name: string
        }>
    }>
}