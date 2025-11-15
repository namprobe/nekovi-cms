//src/features/products/hooks/use-blog-post-detail.ts

"use client"

import { useEffect, useState, useCallback } from "react"
import { blogPostService } from "@/entities/blog-post/blog-post.service"
import type { BlogPostDetailResponse } from "@/entities/blog-post/types/blog-post"

export function useBlogPostDetail(id?: string) {
    const [item, setItem] = useState<BlogPostDetailResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        if (!id) {
            setError("No ID provided")
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await blogPostService.getBlogPostById(id)
            if (res.isSuccess && res.data) {
                setItem(res.data)
            } else {
                setError(res.message || "Không tìm thấy bài viết")
            }
        } catch (err: any) {
            console.error("Fetch blog post error:", err)
            setError(err?.message || "Lỗi mạng")
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { item, loading, error, refresh: fetch }
}