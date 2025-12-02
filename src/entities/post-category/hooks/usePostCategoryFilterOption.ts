// src/entities/post-category/hooks/usePostCategoryFilterOption.ts
import { useState, useEffect } from "react"
import { postCategoryService } from "../post-category.service"
import type { Option } from "@/shared/ui/selects/async-select"

export function usePostCategoryFilterOption(categoryIdFromUrl: string) {
    const [selectedOption, setSelectedOption] = useState<Option | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!categoryIdFromUrl || categoryIdFromUrl === "all") {
            setSelectedOption(null)
            return
        }

        let cancelled = false
        setLoading(true)

        postCategoryService
            .getPostCategoryById(categoryIdFromUrl)
            .then((result) => {
                if (!cancelled && result.isSuccess && result.data) {
                    setSelectedOption({
                        id: result.data.id,
                        label: result.data.name,
                    })
                }
            })
            .catch((err) => {
                console.error("Failed to load category for filter:", err)
                // Vẫn để trống thay vì "Loading..." mãi mãi
                if (!cancelled) setSelectedOption(null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [categoryIdFromUrl])

    return { selectedOption, loading }
}