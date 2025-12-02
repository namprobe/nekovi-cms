// src/app/(dashboard)/dashboard/anime-series/view/[id]/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb" // Giả sử bạn có breadcrumb
import { AnimeSeriesView } from "@/features/anime-series/components/AnimeSeriesView"

interface AnimeSeriesViewPageProps {
  params: Promise<{ id: string }>
}

export default function AnimeSeriesViewPage({ params }: AnimeSeriesViewPageProps) {
  // Unwrap params (cho Next.js 15), nếu dùng Next 14 có thể khác một chút nhưng code này vẫn ổn
  const { id } = use(params)

  return (
    <div className="space-y-6">
      {/* Breadcrumb có thể cấu hình dynamic nếu cần */}
      <Breadcrumb />

      {/* ✅ Truyền đúng prop id */}
      <AnimeSeriesView id={id} />
    </div>
  )
}