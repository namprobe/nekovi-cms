//src/app/%28dashboard%29/dashboard/anime-series/create/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { AnimeSeriesForm } from "@/features/anime-series/components/anime-series-form"

export default function CreateAnimeSeries() {
  return (
    <div>
      <Breadcrumb />
      <AnimeSeriesForm />
    </div>
  )
}
