// src/entities/tags/services/tag.ts
import { env } from "@/core/config/env"

export interface Tag {
    id: string
    name: string
}

export const tagService = {
    async getTags(search: string = "", page: number = 1, pageSize: number = 20) {
        const url = new URL(`${env.BASE_URL}${env.CMS_PREFIX}/tags`)
        if (search) url.searchParams.append("search", search)
        url.searchParams.append("page", page.toString())
        url.searchParams.append("pageSize", pageSize.toString())

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error("Failed to fetch tags")

        return res.json() as Promise<{
            items: Tag[]
            total: number
            hasMore: boolean
        }>
    },
}
