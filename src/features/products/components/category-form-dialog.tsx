// src/features/products/components/category-form-dialog.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { AsyncSelect } from "@/shared/ui/selects/async-select"
import { useCategorySelectStore } from "@/entities/categories/services/category-select-service"
import type { Category } from "@/entities/categories/types/category"
import type { Option } from "@/shared/ui/selects/async-select"
import { Upload, X, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: Category[]
    editingCategory?: Category | null
    onSave: (formData: FormData, isEdit: boolean, id?: string) => Promise<void>
}

export function CategoryFormDialog({ open, onOpenChange, categories, editingCategory, onSave }: CategoryFormDialogProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState({ name: "", description: "", parentCategoryId: "" })
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const { fetchOptions, setOptions } = useCategorySelectStore()
    const [removeImage, setRemoveImage] = useState(false)


    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                description: editingCategory.description || "",
                parentCategoryId: editingCategory.parentCategoryId || "",
            })
            setPreviewUrl(editingCategory.imagePath || null)
            setFile(null)
        } else {
            setFormData({ name: "", description: "", parentCategoryId: "" })
            setPreviewUrl(null)
            setFile(null)
        }
        setErrors({})
    }, [editingCategory])

    // Preload category options, inspired by product-form.tsx
    useEffect(() => {
        const loadInitialOptions = async () => {
            try {
                const options = await fetchOptions("")
                setOptions(options)
                if (editingCategory?.parentCategoryId && !options.find(opt => opt.id === editingCategory.parentCategoryId)) {
                    const specificOption = await fetchOptions(editingCategory.parentCategoryId)
                    if (specificOption.length > 0) {
                        setOptions([...options, ...specificOption])
                    }
                }
            } catch (err: any) {
                console.error("Error loading category options:", err)
                toast({ title: "Error", description: err.message || "Failed to load category options", variant: "destructive" })
            }
        }
        if (open) {
            loadInitialOptions()
        }
    }, [open, editingCategory, fetchOptions, setOptions, toast])

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
        if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile && !["image/jpeg", "image/png"].includes(selectedFile.type)) {
            setErrors({ imageFile: "Image must be JPEG or PNG" })
            return
        }
        if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
            setErrors({ imageFile: "Image size must not exceed 3MB" })
            return
        }
        setFile(selectedFile)
        if (selectedFile) setPreviewUrl(URL.createObjectURL(selectedFile))
        else setPreviewUrl(editingCategory?.imagePath || null)
    }

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        } else if (formData.name.length < 2 || formData.name.length > 150) {
            newErrors.name = "Name must be between 2 and 150 characters"
        }
        if (formData.description && formData.description.length > 1000) {
            newErrors.description = "Description must not exceed 1000 characters"
        }
        if (formData.parentCategoryId && !categories.find(cat => cat.id === formData.parentCategoryId)) {
            newErrors.parentCategoryId = "Invalid parent category"
        }
        if (editingCategory?.id === formData.parentCategoryId) {
            newErrors.parentCategoryId = "A category cannot be its own parent"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const data = new FormData()
        data.append("Name", formData.name)
        data.append("Description", formData.description || "")
        if (formData.parentCategoryId) data.append("ParentCategoryId", formData.parentCategoryId)
        data.append("Status", "1") // Change to "Active" if back-end requires string
        if (file) data.append("ImageFile", file)
        data.append("RemoveImage", removeImage.toString())


        setIsLoading(true)
        try {
            await onSave(data, !!editingCategory, editingCategory?.id)
            toast({ title: "Success", description: editingCategory ? "Category updated successfully" : "Category created successfully" })
            onOpenChange(false)
        } catch (err: any) {
            const errorMessage = err.message || "Failed to save category"
            setErrors({ general: errorMessage })
            toast({ title: "Error", description: errorMessage, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveImage = () => {
        setFile(null)
        setPreviewUrl(null)
        setRemoveImage(true)
    }


    const fetchCategoryOptions = useCallback(async (search: string): Promise<Option[]> => {
        try {
            const options = await fetchOptions(search)
            return options
                .filter(opt => opt.id !== editingCategory?.id) // Exclude current category
                .map((opt) => ({ id: opt.id, label: opt.name }))
        } catch (err: any) {
            console.error("Error fetching category options:", err)
            toast({ title: "Error", description: err.message || "Failed to fetch category options", variant: "destructive" })
            return []
        }
    }, [fetchOptions, editingCategory, toast])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                    <DialogDescription>
                        {editingCategory
                            ? "Update category details and upload a new image if needed."
                            : "Add a new category including optional image."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="parentCategory">Parent Category</Label>
                        <AsyncSelect
                            value={formData.parentCategoryId}
                            onChange={(value) => handleInputChange("parentCategoryId", value)}
                            fetchOptions={fetchCategoryOptions}
                            placeholder="Select parent category"
                            disabled={isLoading}
                        />
                        {errors.parentCategoryId && <p className="text-sm text-red-600">{errors.parentCategoryId}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Category Image</Label>
                        {previewUrl ? (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="object-cover w-full h-full"
                                />

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={handleRemoveImage}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById("image-upload")?.click()}
                                    disabled={isLoading}
                                >
                                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                                </Button>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                                {errors.imageFile && <p className="text-sm text-red-600">{errors.imageFile}</p>}
                            </div>
                        )}
                    </div>

                </div>

                <DialogFooter className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            editingCategory ? "Update" : "Create"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}