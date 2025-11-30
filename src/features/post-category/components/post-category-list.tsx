// src/features/post-category/components/post-category-list.tsx
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { postCategoryService } from "@/entities/post-category/post-category.service"
import type { PostCategoryItem } from "@/entities/post-category/types/post-category"
import { PostCategoryFormDialog } from "./post-category-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

export function PostCategoryList() {
    const { toast } = useToast()
    const router = useRouter()

    const [categories, setCategories] = useState<PostCategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebounce(searchTerm, 400)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<PostCategoryItem | null>(null)

    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)

    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!loading && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [loading])

    // Gọi API chỉ khi page hoặc debouncedSearch thay đổi
    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await postCategoryService.getPostCategories({
                page,
                pageSize: limit,
                search: debouncedSearch || undefined,
            })
            setCategories(response.items || [])
            setTotal(response.totalItems || 0)
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to load categories", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // 1. Khi page hoặc debouncedSearch thay đổi → fetch
    useEffect(() => {
        fetchCategories()
    }, [page, debouncedSearch])

    // 2. Reset page về 1 khi người dùng bắt đầu gõ (trước khi debounce)
    useEffect(() => {
        setPage(1)
    }, [searchTerm])   // <-- chỉ reset page, không gọi API

    const getStatusBadge = (status: number) => {
        const text = status === 1 ? "Active" : "Inactive"
        return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{text}</Badge>
    }

    /* ---- các hàm handleCreate, handleEdit, handleDelete, handleSave giữ nguyên ---- */
    const handleCreate = () => {
        setEditingCategory(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (category: PostCategoryItem) => {
        setEditingCategory(category)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa danh mục này?")) return
        try {
            await postCategoryService.deletePostCategory(id)
            toast({ title: "Thành công", description: "Xóa danh mục thành công" })
            fetchCategories()
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Xóa thất bại", variant: "destructive" })
        }
    }

    const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
        try {
            if (isEdit && id) {
                await postCategoryService.updatePostCategory(id, formData)
                toast({ title: "Thành công", description: "Cập nhật danh mục thành công" })
            } else {
                await postCategoryService.createPostCategory(formData)
                toast({ title: "Thành công", description: "Tạo danh mục thành công" })
            }
            setIsDialogOpen(false)
            fetchCategories()
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Lưu thất bại", variant: "destructive" })
        }
    }

    /* ------------------- UI ------------------- */
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Danh mục bài viết</CardTitle>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
                    </Button>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>

            {/* ... Table, pagination, dialog ... (giữ nguyên) */}
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên danh mục</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{cat.description || "-"}</TableCell>
                                <TableCell>{getStatusBadge(cat.status)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(cat)}>
                                                <Edit className="mr-2 h-4 w-4" /> Sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(cat.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        Không tìm thấy danh mục nào
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <Button disabled={page <= 1} onClick={() => setPage(page - 1)} variant="outline" size="sm">
                        Trước
                    </Button>
                    <span className="text-sm">
                        Trang {page} / {Math.ceil(total / limit) || 1}
                    </span>
                    <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)} variant="outline" size="sm">
                        Sau
                    </Button>
                </div>
            </CardContent>

            {isDialogOpen && (
                <PostCategoryFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingCategory={editingCategory}
                    onSave={handleSave}
                />
            )}
        </Card>
    )
}