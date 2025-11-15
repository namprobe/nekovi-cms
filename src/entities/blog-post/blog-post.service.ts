// src/entities/blog-post/blog-post.service.ts
import { cmsApiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type {
    BlogPostListItem,
    CreateBlogPostDto,
    UpdateBlogPostDto,
    PaginatedBlogPostList,
    BlogPostFilter,
    BlogPostDetailResponse,
} from "./types/blog-post"
import { ApiResult } from "@/shared/types/common"

/**
 * blogPostService - wrapper cho tất cả endpoint /api/cms/blog-posts
 */
export const blogPostService = {
    /**
     * Lấy danh sách blog post có phân trang + filter
     */
    getBlogPosts: (params?: BlogPostFilter) => {
        return cmsApiClient.paginate<BlogPostListItem>(
            env.ENDPOINTS.BLOGPOST.LIST,
            {
                search: params?.search,
                title: params?.title,
                postCategoryId: params?.postCategoryId,
                authorId: params?.authorId,
                isPublished: params?.isPublished,
                tagIds: params?.tagIds?.join(","),
                status: params?.status,
                page: params?.page,
                limit: params?.pageSize,
                sortBy: params?.sortBy,
                sortOrder: params?.sortOrder,
            }
        )
    },

    /**
     * Chi tiết 1 blog post theo id
     */

    getBlogPostById: (id: string): Promise<ApiResult<BlogPostDetailResponse>> =>
        cmsApiClient.get<BlogPostDetailResponse>(  // ← CHỈ CẦN BlogPostDetailResponse
            env.ENDPOINTS.BLOGPOST.DETAIL(id)
        ),

    /**
     * Tạo blog post mới (FormData vì có ảnh)
     */
    createBlogPost: (formData: FormData) =>
        cmsApiClient.postFormData(env.ENDPOINTS.BLOGPOST.CREATE, formData),

    /**
     * Update blog post (FormData)
     */
    updateBlogPost: (id: string, formData: FormData) =>
        cmsApiClient.putFormData(env.ENDPOINTS.BLOGPOST.UPDATE(id), formData),

    /**
     * Xóa blog post
     */
    deleteBlogPost: (id: string) =>
        cmsApiClient.delete(env.ENDPOINTS.BLOGPOST.DELETE(id)),

    publishBlogPost: (id: string, isPublished: boolean): Promise<ApiResult<BlogPostDetailResponse>> => {
        const formData = new FormData()
        formData.append("isPublished", isPublished.toString())
        return cmsApiClient.patchFormData(env.ENDPOINTS.BLOGPOST.PUBLISH(id), formData)
    },
}