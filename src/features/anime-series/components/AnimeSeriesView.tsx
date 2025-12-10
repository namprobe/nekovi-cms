// src/features/anime-series/components/AnimeSeriesView.tsx
"use client"

import { useRouter } from "next/navigation"
import { useAnimeSeriesDetail } from "@/features/anime-series/hooks/use-anime-series-detail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Skeleton } from "@/shared/ui/skeleton"
import { ArrowLeft, Calendar, Clock, Edit, Film, AlertCircle } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { EntityStatus } from "@/shared/types/common"

interface AnimeSeriesViewProps {
    id: string
}

export function AnimeSeriesView({ id }: AnimeSeriesViewProps) {
    const router = useRouter()
    const { item, loading, error } = useAnimeSeriesDetail(id)

    // Helper render status (giống bên List)
    const getStatusBadge = (status: number) => {
        switch (status) {
            case EntityStatus.Active:
                return <Badge variant="default" className="bg-green-600">Active</Badge>
            case EntityStatus.Inactive:
                return <Badge variant="secondary">Inactive</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    if (loading) {
        return <AnimeSeriesViewSkeleton />
    }

    if (error || !item) {
        return (
            <Card className="border-red-200">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center text-red-600">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error || "Series không tồn tại"}</p>
                    <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            ID: <span className="font-mono text-xs">{item.id}</span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push(ROUTES.ANIME_SERIES_EDIT(item.id))}>
                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                </Button>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cột trái: Ảnh */}
                    <div className="md:col-span-1">
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden border bg-muted shadow-sm">
                            {item.imagePath ? (
                                <img
                                    src={item.imagePath}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                                    <Film className="h-12 w-12 mb-2" />
                                    <span>No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột phải: Thông tin chi tiết */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Status & Year */}
                        <div className="flex items-center gap-4">
                            {getStatusBadge(item.status)}
                            <div className="flex items-center text-sm text-muted-foreground border-l pl-4">
                                <Calendar className="mr-2 h-4 w-4" />
                                Năm phát hành: <span className="font-medium text-foreground ml-1">{item.releaseYear}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Mô tả</h3>
                            <div className="p-4 bg-muted/30 rounded-md border text-sm leading-relaxed whitespace-pre-line">
                                {item.description || "Chưa có mô tả cho series này."}
                            </div>
                        </div>

                        {/* Meta Info (Ngày tạo/cập nhật) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Ngày tạo:</span>
                                <span className="font-medium text-foreground">
                                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            {item.updatedAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Edit className="h-4 w-4" />
                                    <span>Cập nhật lần cuối:</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Component Skeleton Loading riêng
function AnimeSeriesViewSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center space-x-4 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="aspect-[2/3] rounded-lg md:col-span-1" />
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-32 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}