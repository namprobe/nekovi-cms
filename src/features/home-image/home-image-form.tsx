// src/features/cms/components/home-image-form.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent } from "@/shared/ui/card"
import { Loader2, Upload, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { homeImageService } from "@/entities/home-image/services/home-image"
import { AsyncSelect, type Option } from "@/shared/ui/selects/async-select"
import { useAnimeSeriesSelectStore } from "@/entities/anime-series/services/anime-series-select-service"
import { ROUTES } from "@/core/config/routes"

interface Props {
    initialData?: any
    isEditing?: boolean
}

export function HomeImageForm({ initialData, isEditing = false }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [name, setName] = useState(initialData?.name || "")
    const [animeSeriesId, setAnimeSeriesId] = useState(initialData?.animeSeriesId || "")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imagePath || "")
    const [loading, setLoading] = useState(false)

    const { fetchOptions } = useAnimeSeriesSelectStore()

    const initialAnimeOption = useMemo(() => {
        if (isEditing && initialData?.animeSeriesId && initialData?.animeSeriesName) {
            return { id: initialData.animeSeriesId, label: initialData.animeSeriesName }
        }
        return null
    }, [initialData, isEditing])

    useEffect(() => {
        fetchOptions("")
    }, [fetchOptions])

    // Xử lý upload ảnh
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Error", description: "Ảnh không được vượt quá 5MB", variant: "destructive" })
            return
        }

        // Validate extension
        const ext = file.name.split(".").pop()?.toLowerCase()
        if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
            toast({ title: "Error", description: "Chỉ chấp nhận .jpg, .jpeg, .png, .webp, .gif", variant: "destructive" })
            return
        }

        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    // Xóa ảnh
    const removeImage = () => {
        setImageFile(null)
        setPreviewUrl("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast({ title: "Error", description: "Name is required", variant: "destructive" })
            return
        }
        if (!imageFile && !isEditing) {
            toast({ title: "Error", description: "Image is required", variant: "destructive" })
            return
        }

        setLoading(true)
        const fd = new FormData()
        fd.append("name", name.trim())
        if (animeSeriesId) fd.append("animeSeriesId", animeSeriesId)
        if (imageFile) {
            fd.append("imageFile", imageFile)
        } else if (isEditing && initialData?.imagePath) {
            fd.append("existingImagePath", initialData.imagePath)
        }

        try {
            const res = isEditing && initialData?.id
                ? await homeImageService.update(initialData.id, fd)
                : await homeImageService.create(fd)

            if (res.isSuccess) {
                toast({ title: "Thành công!", description: isEditing ? "Cập nhật thành công" : "Tạo mới thành công" })
                router.push(ROUTES.HOME_IMAGES)
            } else {
                toast({ title: "Lỗi", description: res.message || "Có lỗi xảy ra", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Lỗi", description: "Lỗi hệ thống", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const fetchAnimeOptions = async (search: string): Promise<Option[]> => {
        const items = await fetchOptions(search)
        return items.map(item => ({ id: item.id, label: item.title }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={ROUTES.HOME_IMAGES}><ArrowLeft /></Link>
                </Button>
                <h1 className="text-3xl font-bold">{isEditing ? "Chỉnh sửa" : "Thêm"} Home Image</h1>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Cột trái: Upload ảnh - giống BlogPostForm */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Image {isEditing ? "(có thể bỏ trống nếu không đổi)" : "*"}</Label>

                                    {previewUrl ? (
                                        <div className="relative group">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-96 object-cover rounded-lg shadow-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={removeImage}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                            <div className="space-y-4">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById("home-image-upload")?.click()}
                                                        disabled={loading}
                                                    >
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Chọn ảnh từ máy
                                                    </Button>
                                                    <input
                                                        id="home-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Định dạng: JPG, PNG, WebP, GIF • Tối đa 5MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cột phải: Form */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên ảnh *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ví dụ: Banner Summer Sale 2025"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Anime Series (tùy chọn)</Label>
                                    <AsyncSelect
                                        value={animeSeriesId}
                                        onChange={setAnimeSeriesId}
                                        fetchOptions={fetchAnimeOptions}
                                        placeholder="Tìm và chọn anime series..."
                                        disabled={loading}
                                        clearable={true}
                                        initialSelectedOption={initialAnimeOption}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nút submit */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button type="button" variant="outline" asChild disabled={loading}>
                                <Link href={ROUTES.HOME_IMAGES}>Hủy</Link>
                            </Button>
                            <Button type="submit" disabled={loading} className="min-w-32">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? "Cập nhật" : "Tạo mới"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}