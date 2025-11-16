// src/entities/post-category/hooks/usePostCategoryStore.ts
import { useState, useCallback } from "react"
import { postCategoryService } from "../post-category.service"
import { SelectOption } from "@/shared/types/select"

export const usePostCategoryStore = () => {
    const [options, setOptions] = useState<SelectOption[]>([])

    const fetchOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        try {
            const data = await postCategoryService.getSelectList(search)
            const mapped = data.map((item: any) => ({
                id: item.id.toString(),
                label: item.label,
            }))
            setOptions(mapped)
            return mapped
        } catch (err) {
            console.error("Failed to fetch post categories:", err)
            setOptions([])
            return []
        }
    }, [])

    return {
        fetchOptions,
        options,
        setOptions,
    }
}