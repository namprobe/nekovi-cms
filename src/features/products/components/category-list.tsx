"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import type { Category } from "@/entities/products/types/product"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"

// Mock data - replace with actual API call
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Figures",
    description: "Action figures and collectible figures",
    parentCategoryId: undefined,
    imagePath: "/anime-figures.jpg",
    createdAt: new Date(),
    createdBy: "admin",
    updatedAt: new Date(),
    updatedBy: "admin",
    isDeleted: false,
    status: 1,
  },
  {
    id: "2",
    name: "Nendoroids",
    description: "Cute chibi-style figures",
    parentCategoryId: "1",
    imagePath: "/nendoroid.jpg",
    createdAt: new Date(),
    createdBy: "admin",
    updatedAt: new Date(),
    updatedBy: "admin",
    isDeleted: false,
    status: 1,
  },
  {
    id: "3",
    name: "Statues",
    description: "High-quality collectible statues",
    parentCategoryId: undefined,
    imagePath: "/anime-statue.jpg",
    createdAt: new Date(),
    createdBy: "admin",
    updatedAt: new Date(),
    updatedBy: "admin",
    isDeleted: false,
    status: 1,
  },
  {
    id: "4",
    name: "Posters",
    description: "Anime posters and wall art",
    parentCategoryId: undefined,
    imagePath: "/anime-poster.png",
    createdAt: new Date(),
    createdBy: "admin",
    updatedAt: new Date(),
    updatedBy: "admin",
    isDeleted: false,
    status: 0,
  },
]

export function CategoryList() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategoryId: "",
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return "-"
    const parent = categories.find((cat) => cat.id === parentId)
    return parent ? parent.name : "-"
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", parentCategoryId: "" })
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      parentCategoryId: category.parentCategoryId || "",
    })
    setIsDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    // TODO: Implement API call
    console.log("Saving category:", formData)
    setIsDialogOpen(false)
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update the category information."
                    : "Add a new product category to organize your products."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <select
                    id="parentCategory"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.parentCategoryId}
                    onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                  >
                    <option value="">No parent (Top level)</option>
                    {categories
                      .filter((cat) => cat.id !== editingCategory?.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaveCategory}>
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={category.imagePath || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
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
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
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

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
