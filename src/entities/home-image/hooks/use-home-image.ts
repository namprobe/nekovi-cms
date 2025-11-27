// src/entities/home-image/hooks/use-home-image.ts
"use client"

import { useState, useEffect } from "react"
import { homeImageService } from "../services/home-image"
import type { HomeImageListItem } from "../types/home-image"

export function useHomeImageDetail(id?: string) {
    const [item, setItem] = useState<HomeImageListItem | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        const fetch = async () => {
            setLoading(true)
            try {
                const res = await homeImageService.getById(id)
                if (res.isSuccess && res.data) {
                    setItem(res.data)
                } else {
                    setError(res.message || "Not found")
                }
            } catch (err: any) {
                setError(err.message || "Failed to load")
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [id])

    return { item, loading, error }
}