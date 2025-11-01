// src/entities/post-category/hooks/usePostCategoryOptions.ts
import { useCallback } from "react"
import { postCategoryService } from "../post-category.service"
import { SelectOption } from "@/shared/types/select"

export const usePostCategoryOptions = () => {
    const fetchOptions = useCallback(async (search: string): Promise<SelectOption[]> => {
        return await postCategoryService.getSelectList(search)
    }, [])

    return fetchOptions
}