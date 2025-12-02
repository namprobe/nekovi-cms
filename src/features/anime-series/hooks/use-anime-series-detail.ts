// src/entities/anime-series/hooks/use-anime-series-detail.ts
import { useEffect, useState } from "react"
import { animeSeriesService } from "@/entities/anime-series/services/anime-series"
import type { AnimeSeriesItem } from "@/entities/anime-series/types/anime-series"

export const useAnimeSeriesDetail = (id: string) => {
    const [item, setItem] = useState<AnimeSeriesItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const res = await animeSeriesService.getById(id)
                if (res.isSuccess && res.data) {
                    setItem(res.data)
                } else {
                    setError(res.message || "Không tìm thấy dữ liệu")
                }
            } catch (err: any) {
                setError(err.message || "Lỗi kết nối")
            } finally {
                setLoading(false)
            }
        }

        fetch()
    }, [id])

    return { item, loading, error }
}