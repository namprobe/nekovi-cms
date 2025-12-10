// src/app/(dashboard)/dashboard/anime-series/page.tsx
import AnimeSeriesList from "@/features/anime-series/components/anime-series-list"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"

export default function AnimeSeriesPage() {
    return (
        <div>
            <Breadcrumb />
            <AnimeSeriesList />
        </div>
    )
}
