// src/features/anime-series/components/AnimeSeriesForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Loader2, Save, X, Upload, Trash2, Eye, Film } from "lucide-react"

import { animeSeriesService } from "@/entities/anime-series/services/anime-series"
import { ROUTES } from "@/core/config/routes"
import { toast } from "sonner"

interface AnimeSeriesFormData {
    id?: string
    title: string
    description?: string
    releaseYear: number
    status: "Active" | "Inactive"
}

interface AnimeSeriesFormProps {
    initialData?: Partial<AnimeSeriesFormData> & { imagePath?: string }
    isEditing?: boolean
}

export function AnimeSeriesForm({ initialData, isEditing = false }: AnimeSeriesFormProps) {
    const router = useRouter()

    const [formData, setFormData] = useState<AnimeSeriesFormData>({
        id: initialData?.id,
        title: initialData?.title || "",
        description: initialData?.description || "",
        releaseYear: initialData?.releaseYear || new Date().getFullYear(),
        status: initialData?.status || "Active",
    })

    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imagePath || "")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [previewMode, setPreviewMode] = useState(false)

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Title required
        if (!formData.title.trim()) {
            newErrors.title = "Title is required"
        } else if (formData.title.trim().length < 2) {
            newErrors.title = "Title must be at least 2 characters"
        }

        // Release year
        if (formData.releaseYear < 1900 || formData.releaseYear > new Date().getFullYear() + 5) {
            newErrors.releaseYear = `Release year must be between 1900 and ${new Date().getFullYear() + 5}`
        }

        // Image required
        const hasImage = imageFile || previewUrl

        if (!hasImage) {
            if (!isEditing) {
                newErrors.image = "Please upload a cover image (required for creation)"
            } else {
                newErrors.image = "Cover image is required. Please upload a new image or keep the existing one."
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            toast.error("Please fix the errors before saving")
            return
        }

        setIsLoading(true)
        const formDataToSend = new FormData()

        formDataToSend.append("Title", formData.title.trim())
        formDataToSend.append("ReleaseYear", formData.releaseYear.toString())
        formDataToSend.append("Status", formData.status === "Active" ? "1" : "0")

        if (formData.description?.trim()) {
            formDataToSend.append("Description", formData.description.trim())
        }

        if (imageFile) {
            formDataToSend.append("ImageFile", imageFile, imageFile.name)
        }
        else if (isEditing && !previewUrl && initialData?.imagePath) {
            formDataToSend.append("RemoveImage", "true")
        }

        try {
            const result = isEditing && formData.id
                ? await animeSeriesService.update(formData.id, formDataToSend)
                : await animeSeriesService.create(formDataToSend)

            if (result.isSuccess) {
                toast.success(isEditing ? "Updated successfully!" : "Anime series created!")
                router.push(ROUTES.ANIME_SERIES)
                router.refresh()
            } else {
                const msg = result.message || result.errors?.join(", ") || "Something went wrong"
                toast.error(msg)
            }
        } catch (err: any) {
            toast.error("System error: " + (err.message || "Unknown error"))
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = <K extends keyof AnimeSeriesFormData>(
        field: K,
        value: AnimeSeriesFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: "", general: "", image: "" }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            setErrors({ image: "Image must not exceed 10MB" })
            return
        }

        const ext = file.name.split(".").pop()?.toLowerCase()
        if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
            setErrors({ image: "Only these formats are allowed: JPG, PNG, WebP, GIF" })
            return
        }

        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setErrors(prev => ({ ...prev, image: "" }))
    }

    const removeImage = () => {
        if (!isEditing) {
            toast.error("Cannot delete image when creating — cover image is required!")
            return
        }
        setImageFile(null)
        setPreviewUrl("")
        toast.info("Image will be removed after saving")
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {isEditing ? "Edit Anime Series" : "Create New Anime Series"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEditing
                            ? "Update anime series information"
                            : "Add a new anime series to the system"}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    disabled={isLoading}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    {previewMode ? "Edit" : "Preview"}
                </Button>
            </div>

            {previewMode ? (
                <Card>
                    <CardContent className="p-8">
                        {previewUrl ? (
                            <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8 bg-muted">
                                <img src={previewUrl} alt={formData.title} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="bg-muted border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center mb-8">
                                <Film className="w-20 h-20 text-muted-foreground/50" />
                            </div>
                        )}
                        <h1 className="text-4xl font-bold mb-4">{formData.title || "No title yet"}</h1>
                        <div className="flex items-center gap-6 text-lg text-muted-foreground mb-6">
                            <span>Release Year: <strong className="text-foreground">{formData.releaseYear}</strong></span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {formData.status === "Active" ? "Active" : "Inactive"}
                            </span>
                        </div>
                        {formData.description ? (
                            <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
                                {formData.description.split("\n").map((line, i) => (
                                    <p key={i} className="mb-4">{line || <br />}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No description yet...</p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {errors.general && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errors.general}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={e => handleInputChange("title", e.target.value)}
                                            placeholder="Example: Attack on Titan, One Piece..."
                                            disabled={isLoading}
                                            className="text-lg"
                                        />
                                        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            rows={10}
                                            value={formData.description || ""}
                                            onChange={e => handleInputChange("description", e.target.value)}
                                            placeholder="Write a short description about this anime series..."
                                            disabled={isLoading}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {(formData.description || "").length} characters
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Cover Image */}
                                    <div className="space-y-3">
                                        <Label>
                                            Cover Image {!isEditing && <span className="text-red-600">*</span>}
                                        </Label>
                                        {previewUrl || imageFile ? (
                                            <div className="relative rounded-lg overflow-hidden border">
                                                <img
                                                    src={previewUrl || URL.createObjectURL(imageFile!)}
                                                    alt="Preview"
                                                    className="w-full h-64 object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-3 right-3 shadow-lg"
                                                    onClick={removeImage}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => document.getElementById("image-upload-anime")?.click()}
                                                    disabled={isLoading}
                                                >
                                                    <Upload className="mr-2 h-5 w-5" />
                                                    Upload Image
                                                </Button>
                                                <input
                                                    id="image-upload-anime"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    disabled={isLoading}
                                                />
                                                <p className="text-xs text-muted-foreground mt-3">
                                                    Max 10MB • JPG, PNG, WebP, GIF
                                                </p>
                                                {!isEditing && (
                                                    <p className="text-xs text-red-600 mt-2 font-medium">
                                                        Image is required when creating
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                                    </div>

                                    {/* Other fields */}
                                    <div className="space-y-2">
                                        <Label htmlFor="releaseYear">Release Year *</Label>
                                        <Input
                                            id="releaseYear"
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear() + 5}
                                            value={formData.releaseYear}
                                            onChange={e => handleInputChange("releaseYear", parseInt(e.target.value) || new Date().getFullYear())}
                                            disabled={isLoading}
                                        />
                                        {errors.releaseYear && <p className="text-sm text-red-600">{errors.releaseYear}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant={formData.status === "Active" ? "default" : "outline"}
                                                onClick={() => handleInputChange("status", "Active")}
                                                disabled={isLoading}
                                            >
                                                Active
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={formData.status === "Inactive" ? "default" : "outline"}
                                                onClick={() => handleInputChange("status", "Inactive")}
                                                disabled={isLoading}
                                            >
                                                Inactive
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-8 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => router.push(ROUTES.ANIME_SERIES)}
                                    disabled={isLoading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button type="submit" size="lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {isEditing ? "Update" : "Create"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
