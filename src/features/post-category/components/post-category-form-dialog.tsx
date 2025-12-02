// src/features/post-category/components/post-category-form-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PostCategoryItem } from "@/entities/post-category/types/post-category"

interface PostCategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingCategory?: PostCategoryItem | null
    onSave: (formData: FormData, isEdit: boolean, id?: string) => Promise<void>
}

export function PostCategoryFormDialog({
    open,
    onOpenChange,
    editingCategory,
    onSave,
}: PostCategoryFormDialogProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState({ name: "", description: "", status: 1 })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                description: editingCategory.description || "",
                status: editingCategory.status,
            })
        } else {
            setFormData({ name: "", description: "", status: 1 })
        }
        setErrors({})
    }, [editingCategory])

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = "Category name is required"
        else if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters"
        if (formData.description && formData.description.length > 500)
            newErrors.description = "Description cannot exceed 500 characters"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        const data = new FormData()
        data.append("Name", formData.name)
        data.append("Description", formData.description)
        data.append("Status", formData.status.toString())

        setIsLoading(true)
        try {
            await onSave(data, !!editingCategory, editingCategory?.id)
            onOpenChange(false)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Save failed",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
                    <DialogDescription>
                        {editingCategory
                            ? "Update the post category information."
                            : "Add a new category for posts."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Category Name *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange("status", Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            disabled={isLoading}
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : editingCategory ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
