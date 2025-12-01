// src/features/post-category/components/post-category-list.tsx
"use client"

import { useState, useEffect, useRef } from "react"
// 1. Import thêm hooks cần thiết
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 2. Lấy giá trị khởi tạo từ URL
    const initialPage = Number(searchParams.get("page")) || 1
    const initialSearch = searchParams.get("search") || ""

    // 3. Khởi tạo state bằng giá trị từ URL
    const [categories, setCategories] = useState<PostCategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchTerm, 400)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<PostCategoryItem | null>(null)

    const [page, setPage] = useState(initialPage)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)

    const searchInputRef = useRef<HTMLInputElement>(null)

    // 4. Effect: Đồng bộ state lên URL
    useEffect(() => {
        const params = new URLSearchParams()

        if (page > 1) params.set("page", String(page))
        if (debouncedSearch) params.set("search", debouncedSearch)

        // Dùng replace để không lưu lịch sử dư thừa, scroll: false để không nhảy trang
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [page, debouncedSearch, pathname, router])

    useEffect(() => {
        if (!loading && searchInputRef.current && searchTerm) {
            searchInputRef.current.focus()
        }
    }, [loading])

    // Call API only when page or debouncedSearch changes
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
            toast({
                title: "Error",
                description: error.message || "Failed to load categories",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // 1. Fetch when page or debouncedSearch changes
    useEffect(() => {
        fetchCategories()
    }, [page, debouncedSearch])

    // ❌ XÓA useEffect reset page cũ
    // useEffect(() => {
    //     setPage(1)
    // }, [searchTerm])

    const getStatusBadge = (status: number) => {
        const text = status === 1 ? "Active" : "Inactive"
        return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{text}</Badge>
    }

    /* ---- handleCreate, handleEdit, handleDelete, handleSave ---- */
    const handleCreate = () => {
        setEditingCategory(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (category: PostCategoryItem) => {
        setEditingCategory(category)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return
        try {
            await postCategoryService.deletePostCategory(id)
            toast({ title: "Success", description: "Category deleted successfully" })
            fetchCategories()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Delete failed",
                variant: "destructive",
            })
        }
    }

    const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
        try {
            if (isEdit && id) {
                await postCategoryService.updatePostCategory(id, formData)
                toast({ title: "Success", description: "Category updated successfully" })
            } else {
                await postCategoryService.createPostCategory(formData)
                toast({ title: "Success", description: "Category created successfully" })
            }
            setIsDialogOpen(false)
            fetchCategories()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Save failed",
                variant: "destructive",
            })
        }
    }

    /* ------------------- UI ------------------- */
    if (loading && categories.length === 0) {
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
                    <CardTitle>Post Categories</CardTitle>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search categories..."
                            value={searchTerm}
                            // 5. Logic reset page khi gõ search chuyển vào đây
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {cat.description || "-"}
                                </TableCell>
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
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                        No categories found
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <Button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        variant="outline"
                        size="sm"
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {page} / {Math.ceil(total / limit) || 1}
                    </span>
                    <Button
                        disabled={page * limit >= total}
                        onClick={() => setPage(page + 1)}
                        variant="outline"
                        size="sm"
                    >
                        Next
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