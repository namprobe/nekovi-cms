import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"

export interface CategorySelectItem {
    id: string
    name: string
}

interface CategorySelectState {
    options: CategorySelectItem[]
    isLoading: boolean
    error: string | null
    fetchOptions: (search?: string) => Promise<CategorySelectItem[]>
    clearError: () => void
}

export const useCategorySelectStore = create<CategorySelectState>()(
    devtools((set) => ({
        options: [],
        isLoading: false,
        error: null,

        fetchOptions: async (search = "") => {
            try {
                set({ isLoading: true, error: null })
                const endpoint = `${env.ENDPOINTS.CATEGORY.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ""}`
                const url = `${endpoint}` // Thêm BASE_URL và CMS_PREFIX
                console.log(`Category Fetch URL: ${url}`) // Debug URL
                const res = await apiClient.get<CategorySelectItem[]>(url)
                console.log(`Category Response:`, res) // Debug response từ API
                if (res.isSuccess && res.data) {
                    set({ options: res.data, isLoading: false })
                    return res.data
                } else {
                    throw new Error(res.message || "Failed to fetch category select list")
                }
            } catch (error: any) {
                const message = error instanceof Error ? error.message : "Unexpected error"
                set({ error: message, isLoading: false })
                return []
            }
        },

        clearError: () => set({ error: null }),
    }))
)