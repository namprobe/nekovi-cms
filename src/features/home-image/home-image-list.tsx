// src/features/home-image/home-image-list.tsx
"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation" // 1. Hooks navigation
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash2, Plus, Image as ImageIcon, Search } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Checkbox } from "@/shared/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { homeImageService } from "@/entities/home-image/services/home-image"
import type { HomeImageListItem } from "@/entities/home-image/types/home-image"
import { ROUTES } from "@/core/config/routes"
import { useDebounce } from "@/hooks/use-debounce"
import { AsyncSelect, type Option } from "@/shared/ui/selects/async-select"
import { useAnimeSeriesSelectStore } from "@/entities/anime-series/services/anime-series-select-service"

export function HomeImageList() {
    const { toast } = useToast()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 2. Parse URL Params để khởi tạo State
    const initialPage = Number(searchParams.get("page")) || 1
    const initialSearch = searchParams.get("search") || ""
    const initialAnimeSeriesId = searchParams.get("animeSeriesId") || ""

    // Parse logic cho hasAnimeSeries ("true" | "false" | null)
    let initialHasAnime: boolean | null = null
    const paramHasAnime = searchParams.get("hasAnimeSeries")
    if (paramHasAnime === "true") initialHasAnime = true
    if (paramHasAnime === "false") initialHasAnime = false

    const [images, setImages] = useState<HomeImageListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    // Filters (Khởi tạo từ URL)
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchTerm, 400)

    const [animeSeriesId, setAnimeSeriesId] = useState<string>(initialAnimeSeriesId)
    const [hasAnimeSeries, setHasAnimeSeries] = useState<boolean | null>(initialHasAnime)

    const [page, setPage] = useState(initialPage)
    const limit = 20

    const searchInputRef = useRef<HTMLInputElement>(null)
    const { fetchOptions: fetchAnimeOptions } = useAnimeSeriesSelectStore()

    // 3. Effect: Đồng bộ State lên URL
    useEffect(() => {
        const params = new URLSearchParams()

        if (page > 1) params.set("page", page.toString())
        if (debouncedSearch) params.set("search", debouncedSearch)
        if (animeSeriesId) params.set("animeSeriesId", animeSeriesId)
        if (hasAnimeSeries !== null) params.set("hasAnimeSeries", hasAnimeSeries.toString())

        // scroll: false để giữ vị trí màn hình khi filter
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [page, debouncedSearch, animeSeriesId, hasAnimeSeries, pathname, router])

    const fetchAnimeSeriesOptions = async (search: string): Promise<Option[]> => {
        const items = await fetchAnimeOptions(search)
        return items.map(item => ({
            id: item.id,
            label: item.title
        }))
    }

    const fetchImages = async () => {
        setLoading(true)
        try {
            const result = await homeImageService.getList({
                search: debouncedSearch || undefined,
                animeSeriesId: animeSeriesId || undefined,
                hasAnimeSeries: hasAnimeSeries === null ? undefined : hasAnimeSeries,
                page,
                pageSize: limit,
            })

            if (result.isSuccess && result.items) {
                setImages(result.items)
                setTotal(result.totalItems)
            } else {
                toast({
                    title: "Error",
                    description: (result as any).message || result.errors?.[0] || "Failed to load images",
                    variant: "destructive"
                })
                setImages([])
                setTotal(0)
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Network error. Please check your connection.",
                variant: "destructive"
            })
            setImages([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    // Fetch data khi filter thay đổi
    useEffect(() => {
        fetchImages()
    }, [page, debouncedSearch, animeSeriesId, hasAnimeSeries])

    // Focus lại input khi loading xong (nếu đang có search term)
    useEffect(() => {
        if (!loading && searchInputRef.current && searchTerm) {
            searchInputRef.current.focus()
        }
    }, [loading])

    // ❌ ĐÃ XÓA: useEffect reset page tự động
    // Thay vào đó, setPage(1) nằm trong các sự kiện onChange bên dưới

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this image?")) return

        const res = await homeImageService.delete(id)
        if (res.isSuccess) {
            toast({ title: "Success", description: "Image deleted successfully!" })
            setImages(prev => prev.filter(i => i.id !== id))
            if (images.length === 1 && page > 1) {
                setPage(p => p - 1)
            }
        } else {
            toast({
                title: "Error",
                description: res.message || res.errors?.[0] || "Delete failed",
                variant: "destructive"
            })
        }
    }

    const totalPages = Math.ceil(total / limit) || 1

    if (loading && images.length === 0) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(15)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Home Images</h1>
                <Button asChild>
                    <Link href={ROUTES.HOME_IMAGE_CREATE}>
                        <Plus className="mr-2 h-4 w-4" /> Add Image
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="space-y-4 bg-muted/50 p-5 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search by image name..."
                            value={searchTerm}
                            // 4. Reset page = 1 tại đây
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="pl-10"
                        />
                    </div>

                    <div>
                        <AsyncSelect
                            value={animeSeriesId}
                            // 4. Reset page = 1 tại đây
                            onChange={(val) => {
                                setAnimeSeriesId(val)
                                if (val) setHasAnimeSeries(null)
                                setPage(1)
                            }}
                            fetchOptions={fetchAnimeSeriesOptions}
                            placeholder="All Series"
                            clearable={true}
                        // Lưu ý: Nếu muốn hiển thị label đúng ngay khi reload trang, 
                        // AsyncSelect cần prop `initialSelectedOption` hoặc tự fetch label dựa vào animeSeriesId.
                        // Với code hiện tại, nó sẽ hoạt động nhưng có thể hiển thị ID hoặc trống lúc đầu cho đến khi user tương tác.
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="no-series"
                            checked={hasAnimeSeries === false}
                            // 4. Reset page = 1 tại đây
                            onCheckedChange={(checked) => {
                                const value = checked ? false : null
                                setHasAnimeSeries(value)
                                if (value === false) setAnimeSeriesId("")
                                setPage(1)
                            }}
                        />
                        <Label htmlFor="no-series" className="cursor-pointer select-none">
                            Only images without series
                        </Label>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {!loading && images.length === 0 && (
                <Card className="p-16 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                        {searchTerm || animeSeriesId || hasAnimeSeries !== null
                            ? "No images match your filters"
                            : "No images yet"}
                    </p>
                    <Button asChild className="mt-4">
                        <Link href={ROUTES.HOME_IMAGE_CREATE}>Upload First Image</Link>
                    </Button>
                </Card>
            )}

            {/* Grid + Pagination */}
            {images.length > 0 && (
                <>
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                        {images.map((img) => (
                            <MasonryImageCard key={img.id} image={img} onDelete={() => handleDelete(img.id)} />
                        ))}
                    </div>

                    <div className="flex justify-center items-center gap-6 mt-10">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            Previous
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                            Page <strong>{page}</strong> / <strong>{totalPages}</strong> ({total} images)
                        </span>
                        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

function MasonryImageCard({ image, onDelete }: { image: HomeImageListItem; onDelete: () => void }) {
    const [hovered, setHovered] = useState(false)

    return (
        <motion.div
            layout
            className="break-inside-avoid mb-6 group relative rounded-xl overflow-hidden shadow-lg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <img
                src={image.imagePath}
                alt={image.name}
                className="w-full rounded-xl object-cover"
                loading="lazy"
            />

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-xl p-4 flex flex-col justify-end"
                    >
                        <div>
                            <h3 className="text-white font-bold text-lg truncate">{image.name}</h3>
                            {image.animeSeriesName && (
                                <p className="text-white/80 text-sm">Series: {image.animeSeriesName}</p>
                            )}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button size="sm" variant="secondary" asChild className="backdrop-blur">
                                <Link href={ROUTES.HOME_IMAGE_EDIT(image.id)}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={onDelete} className="backdrop-blur">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function SkeletonCard() {
    return <div className="bg-gray-200 border-2 border-dashed rounded-xl aspect-[3/4] animate-pulse" />
}