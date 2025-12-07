// src/features/anime-series/components/AnimeSeriesList.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Film, Loader2, FilterX, Eye } from "lucide-react" // Thêm icon FilterX
import { ROUTES } from "@/core/config/routes"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { animeSeriesService } from "@/entities/anime-series/services/anime-series"
import type { AnimeSeriesItem } from "@/entities/anime-series/types/anime-series"
import { EntityStatus } from "@/shared/types/common"

export default function AnimeSeriesList() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // 1. Init State from URL
    const initialPage = Number(searchParams.get("page")) || 1
    const initialSearch = searchParams.get("search") || ""
    const initialYear = searchParams.get("releaseYear") || "" // ✅ Lấy năm từ URL

    const [series, setSeries] = useState<AnimeSeriesItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const [page, setPage] = useState(initialPage)
    const [limit] = useState(10)

    // Filter States
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [releaseYear, setReleaseYear] = useState(initialYear) // ✅ State cho năm

    // Debounce cả Search và Year
    const debouncedSearch = useDebounce(searchTerm, 500)
    const debouncedYear = useDebounce(releaseYear, 500) // ✅ Debounce năm

    // 2. Sync State -> URL
    useEffect(() => {
        const params = new URLSearchParams()
        if (page > 1) params.set("page", String(page))
        if (debouncedSearch) params.set("search", debouncedSearch)
        if (debouncedYear) params.set("releaseYear", debouncedYear) // ✅ Push năm lên URL

        const query = params.toString()
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    }, [page, debouncedSearch, debouncedYear, pathname, router]) // ✅ Thêm debouncedYear vào dependency

    // 3. Fetch Data
    const fetchSeries = useCallback(async () => {
        try {
            setLoading(true)
            const res = await animeSeriesService.getList({
                page,
                limit,
                search: debouncedSearch || undefined,
                releaseYear: debouncedYear ? Number(debouncedYear) : undefined, // ✅ Truyền năm xuống API
            })

            setSeries(res.items || [])
            setTotal(res.totalItems || 0)
        } catch (err: any) {
            console.error(err)
            toast({
                title: "Error",
                description: err?.message || "Failed to load anime series",
                variant: "destructive",
            })
            setSeries([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [page, limit, debouncedSearch, debouncedYear, toast]) // ✅ Thêm debouncedYear vào dependency

    useEffect(() => {
        fetchSeries()
    }, [fetchSeries])

    // Xóa tất cả bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("")
        setReleaseYear("")
        setPage(1)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this anime series?")) return
        try {
            const res = await animeSeriesService.delete(id)
            if (res.isSuccess) {
                toast({ title: "Success", description: "Deleted successfully" })
                if (series.length === 1 && page > 1) setPage((prev) => prev - 1)
                else fetchSeries()
            } else {
                toast({ title: "Error", description: res.message || "Failed to delete", variant: "destructive" })
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete", variant: "destructive" })
        }
    }

    const getStatusBadge = (status: number) => {
        switch (status) {
            case EntityStatus.Active:
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
            case EntityStatus.Inactive:
                return <Badge variant="secondary">Inactive</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    // 5. Render
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Anime Series Management</CardTitle>
                    <Button onClick={() => router.push(ROUTES.ANIME_SERIES_CREATE)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Anime
                    </Button>
                </div>

                {/* ✅ Filter Area */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="pl-10"
                        />
                    </div>

                    {/* Release Year Input */}
                    <div className="w-full sm:w-[150px]">
                        <Input
                            type="number"
                            placeholder="Release Year"
                            value={releaseYear}
                            onChange={(e) => {
                                setReleaseYear(e.target.value)
                                setPage(1)
                            }}
                        />
                    </div>

                    {/* Clear Filter Button (Chỉ hiện khi có filter) */}
                    {(searchTerm || releaseYear) && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="px-3 text-muted-foreground hover:text-foreground"
                            title="Clear filters"
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="rounded-md border relative">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Release Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && series.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin inline" /> Loading...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                series.map((item) => (
                                    <TableRow key={item.id} className={loading ? "opacity-50 pointer-events-none" : ""}>
                                        <TableCell>
                                            <div className="w-12 h-16 relative rounded overflow-hidden bg-muted border">
                                                {item.imagePath ? (
                                                    <img
                                                        src={item.imagePath}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                        <Film className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium max-w-md">
                                            <div className="line-clamp-2" title={item.title}>{item.title}</div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="outline">{item.releaseYear}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>

                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(ROUTES.ANIME_SERIES_DETAIL(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(ROUTES.ANIME_SERIES_EDIT(item.id))}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}

                            {!loading && series.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        {searchTerm || releaseYear
                                            ? "No anime series found matching your filters."
                                            : "No anime series available."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {total > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1 || loading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page * limit >= total || loading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}