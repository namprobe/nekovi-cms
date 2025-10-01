import { create } from "zustand"
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"

export interface TagSelectItem {
    id: string
    name: string
}

interface TagSelectState {
    options: TagSelectItem[]
    fetchOptions: (search?: string) => Promise<TagSelectItem[]>
}

export const useTagSelectStore = create<TagSelectState>((set) => ({
    options: [],
    fetchOptions: async (search?: string) => {
        try {
            const endpoint = `${env.ENDPOINTS.TAG.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ""}`
            const res = await apiClient.get<TagSelectItem[]>(endpoint)

            // Lấy data từ ApiResult
            const data = res.isSuccess && res.data ? res.data : []

            set({ options: data })
            return data
        } catch (error) {
            console.error("Failed to fetch tags:", error)
            set({ options: [] })
            return []
        }
    },
}))
