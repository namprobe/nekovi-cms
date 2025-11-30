// src/features/products/components/category-list.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { categoryService } from "@/entities/categories/services/category"
import type { Category } from "@/entities/categories/types/category"
import { CategoryFormDialog } from "./category-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

export function CategoryList() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")                    // ← UI input
  const debouncedSearch = useDebounce(searchTerm, 400)               // ← debounce
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  // ← Thêm ref để focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getCategories({
        page,
        limit,
        search: debouncedSearch || undefined,
      })

      setCategories(response.items || [])
      setTotal(response.totalItems || 0)
    } catch (error: any) {
      console.error("Failed to load categories:", error)
      toast({ title: "Error", description: error.message || "Failed to load categories", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Gọi API khi page hoặc debouncedSearch thay đổi
  useEffect(() => {
    fetchCategories()
  }, [page, debouncedSearch])

  // Reset page về 1 khi người dùng gõ (trước khi debounce)
  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  // ← Focus lại input khi loading xong
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return "-"
    const parent = categories.find((cat) => cat.id === parentId)
    return parent ? parent.name : "-"
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      await categoryService.deleteCategory(categoryId)
      toast({ title: "Success", description: "Category deleted successfully" })
      await fetchCategories()
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" })
    }
  }

  const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
    try {
      if (isEdit && id) {
        await categoryService.updateCategory(id, formData)
        toast({ title: "Success", description: "Category updated successfully" })
      } else {
        await categoryService.createCategory(formData)
        toast({ title: "Success", description: "Category created successfully" })
      }
      setIsDialogOpen(false)
      await fetchCategories()
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to save category", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}  // ← Thêm ref
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}   // ← Chỉ cập nhật UI
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={category.imagePath || "/placeholder.svg"}
                        alt={category.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-medium">{category.name}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                </TableCell>
                <TableCell>{getParentCategoryName(category.parentCategoryId)}</TableCell>
                <TableCell>{getStatusBadge(category.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(total / limit) || 1}
          </span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>

      {isDialogOpen && (
        <CategoryFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          categories={categories}
          editingCategory={editingCategory}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}