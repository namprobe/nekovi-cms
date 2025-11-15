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
    1
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
        if (!formData.name.trim()) newErrors.name = "Tên danh mục là bắt buộc"
        else if (formData.name.length < 2) newErrors.name = "Tên phải ít nhất 2 ký tự"
        if (formData.description && formData.description.length > 500)
            newErrors.description = "Mô tả không được vượt quá 500 ký tự"
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
            toast({ title: "Lỗi", description: err.message || "Lưu thất bại", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? "Sửa danh mục" : "Tạo danh mục mới"}</DialogTitle>
                    <DialogDescription>
                        {editingCategory ? "Cập nhật thông tin danh mục bài viết." : "Thêm danh mục mới cho bài viết."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tên danh mục *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange("status", Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            disabled={isLoading}
                        >
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Không hoạt động</option>
                        </select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                            </>
                        ) : editingCategory ? (
                            "Cập nhật"
                        ) : (
                            "Tạo"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}