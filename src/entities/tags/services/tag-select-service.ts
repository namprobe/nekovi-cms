// src/entities/tags/services/tag-select-service.ts
import { create } from "zustand"
import { apiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"

export interface TagSelectItem {
    id: string
    name: string
}

interface TagSelectState {
    options: TagSelectItem[]
    loading: boolean
    error: string | null
    fetchOptions: (search?: string) => Promise<TagSelectItem[]>
    setOptions: (options: TagSelectItem[]) => void
}

export const useTagSelectStore = create<TagSelectState>((set) => ({
    options: [],
    loading: false,
    error: null,
    fetchOptions: async (search = "") => {
        set({ loading: true, error: null });
        try {
            const endpoint = `${env.ENDPOINTS.TAG.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ""}`;
            const res = await apiClient.get<TagSelectItem[]>(endpoint);
            const data = res.isSuccess && res.data ? res.data : [];
            set({ options: data, loading: false });
            return data;
        } catch (error: any) {
            console.error("Failed to fetch tags:", error);
            set({ options: [], loading: false, error: error.message || "Failed to fetch tags" });
            return [];
        }
    },
    setOptions: (options) => set({ options }),
}));