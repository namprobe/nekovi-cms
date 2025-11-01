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
    postCategoryName?: string
    publishDate: Date
    isPublished: boolean
    featuredImage?: string // URL
    status: number
    postTags: { tagId: string; tagName: string }[]
}

export interface CreateBlogPostDto {
    title: string
    slug: string
    content: string
    excerpt?: string
    publishDate: Date
    isPublished: boolean
    featuredImage?: File
    authorId: string
    postCategoryId?: string
    tagIds?: string[]
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