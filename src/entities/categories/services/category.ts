import { env } from "@/core/config/env"

export interface Category {
    id: string
    name: string
}

export const categoryService = {
    async getCategories(search: string = "", page: number = 1, pageSize: number = 10) {
        const url = new URL(`${env.BASE_URL}${env.CMS_PREFIX}/categories`)
        url.searchParams.append("search", search)
        url.searchParams.append("page", page.toString())
        url.searchParams.append("pageSize", pageSize.toString())

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!res.ok) throw new Error("Failed to fetch categories")
        return res.json() as Promise<{
            items: Category[]
            total: number
            hasMore: boolean
        }>
    },
}
