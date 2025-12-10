// src/app/(dashboard)/dashboard/anime-series/[id]/edit/page.tsx

"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { AnimeSeriesForm } from "@/features/anime-series/components/anime-series-form"
import { useAnimeSeriesDetail } from "@/features/anime-series/hooks/use-anime-series-detail"

interface AnimeSeriesEditPageProps {
  params: Promise<{ id: string }>
}

export default function AnimeSeriesEditPage({ params }: AnimeSeriesEditPageProps) {
  const { id } = use(params)
  const { item: animeSeries, loading, error } = useAnimeSeriesDetail(id)

  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <div className="mt-8 flex items-center justify-center h-64">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  if (error || !animeSeries) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Không thể tải thông tin anime series. Lỗi: {error || "Không tìm thấy"}
        </div>
      </div>
    )
  }

  // CHỖ NÀY SỬA: chuyển status từ number (1/0) → string (narrowed to expected union)
  const rawStatus = String(animeSeries.status).toLowerCase()
  const statusValue: "Active" | "Inactive" = rawStatus === "1" || rawStatus === "active"
    ? "Active"
    : "Inactive"

  const initialData = {
    id: animeSeries.id,
    title: animeSeries.title || "",
    description: animeSeries.description || "",
    releaseYear: animeSeries.releaseYear,
    status: statusValue, // ĐÚNG RỒI!
    imagePath: animeSeries.imagePath || undefined,
  }

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa: {animeSeries.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin chi tiết cho anime series.
          </p>
        </div>

        <AnimeSeriesForm initialData={initialData} isEditing={true} />
      </div>
    </div>
  )
}