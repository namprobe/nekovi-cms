import { env } from "@/core/config/env"

export interface AnimeSeries {
    id: string
    title: string
}

export const animeSeriesService = {
    async getAnimeSeries(search: string = "", page: number = 1, pageSize: number = 10) {
        const url = new URL(`${env.BASE_URL}${env.CMS_PREFIX}/anime-series`)
        url.searchParams.append("search", search)
        url.searchParams.append("page", page.toString())
        url.searchParams.append("pageSize", pageSize.toString())

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!res.ok) throw new Error("Failed to fetch anime series")
        return res.json() as Promise<{
            items: AnimeSeries[]
            total: number
            hasMore: boolean
        }>
    },
}
