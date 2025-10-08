// src/features/products/hooks/use-products.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { productService } from "@/entities/products/services/product"
import type { ProductListItem, ProductResponse, CreateProductDto } from "@/entities/products/types/product"

export function useProducts(paramsInit = { page: 1, limit: 10, search: "" }) {
    const [items, setItems] = useState<ProductListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(paramsInit.page)
    const [limit, setLimit] = useState(paramsInit.limit)
    const [search, setSearch] = useState(paramsInit.search)

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await productService.getProducts({ page, limit, search })
            if ((res as any).isSuccess === false) {
                setError((res as any).message || "Failed to fetch products")
                setItems([])
            } else {
                setItems((res as any).items || [])
                setTotal((res as any).totalItems || 0)
            }
        } catch (err: any) {
            setError(err?.message || "Network error")
        } finally {
            setLoading(false)
        }
    }, [page, limit, search])

    useEffect(() => {
        fetch()
    }, [fetch])

    return {
        items,
        loading,
        error,
        total,
        page,
        limit,
        search,
        setPage,
        setLimit,
        setSearch,
        refresh: fetch,
    }
}

export function useProductDetail(id?: string) {
    const [item, setItem] = useState<ProductResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        if (!id) return
        setLoading(true)
        setError(null)
        try {
            const res = await productService.getProductById(id)
            if (res.isSuccess) {
                setItem(res.data as ProductResponse)
            } else {
                setError(res.message || "Failed to fetch product")
            }
        } catch (err: any) {
            console.error("Fetch Error:", err) // Debug lỗi
            setError(err?.message || "Network error")
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { item, loading, error, refresh: fetch }
}