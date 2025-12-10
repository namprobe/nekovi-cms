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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Badge } from "@/shared/ui/badge"
import { Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Tag } from "@/entities/tags/types/tag"

interface TagFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingTag?: Tag | null
    onSave: (formData: FormData, isEdit: boolean, id?: string) => Promise<void>
}


export function TagFormDialog({ open, onOpenChange, editingTag, onSave }: TagFormDialogProps) {
    const { toast } = useToast()

    // Bỏ status ra khỏi state vì luôn là 1
    const [formData, setFormData] = useState({ name: "", description: "" })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (editingTag) {
            setFormData({
                name: editingTag.name,
                description: editingTag.description || "",
            })
        } else {
            setFormData({ name: "", description: "" })
        }
        setErrors({})
    }, [editingTag, open])


    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        } else if (formData.name.length > 50) {
            newErrors.name = "Name must not exceed 50 characters"
        }
        if (formData.description && formData.description.length > 200) {
            newErrors.description = "Description must not exceed 200 characters"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        const data = new FormData()
        data.append("Name", formData.name.trim())
        if (formData.description.trim()) {
            data.append("Description", formData.description.trim())
        }
        // Luôn gửi Status = 1
        data.append("Status", "1")

        setIsLoading(true)
        try {
            await onSave(data, !!editingTag, editingTag?.id)
            onOpenChange(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
                    <DialogDescription>
                        {editingTag ? "Update tag information." : "Add a new tag to organize content."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="e.g. Electronics, Anime, Sale"
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Brief description of this tag..."
                            rows={3}
                            disabled={isLoading}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : editingTag ? (
                            "Update Tag"
                        ) : (
                            "Create Tag"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}