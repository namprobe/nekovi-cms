"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useProducts } from "@/features/products/hooks/use-products"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Search, Filter } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { productService } from "@/entities/products/services/product"
import { useToast } from "@/hooks/use-toast"


export default function ProductList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { items, loading, error, page, limit, setPage, total, refresh } = useProducts({
    page: 1,
    limit: 10,
    search: "",
  })

  const [filteredProducts, setFilteredProducts] = useState(items)

  useEffect(() => {
    let filtered = items.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    // filter by category if needed
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())
    }
    setFilteredProducts(filtered)
  }, [items, searchTerm, selectedCategory])

  // Thêm hàm handleDelete
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await productService.deleteProduct(id)
      toast({
        title: "Deleted successfully",
        description: "The product has been removed from the list.",
      })
      refresh()
    } catch (err) {
      console.error("Delete product failed:", err)
      toast({
        title: "Delete failed",
        description: "Something went wrong while deleting the product.",
        variant: "destructive",
      })
    }
  }


  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="error">Out of Stock</Badge>
    if (quantity <= 5) return <Badge variant="warning">Low Stock</Badge>
    return <Badge variant="success">In Stock</Badge>
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Button onClick={() => router.push(ROUTES.PRODUCT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
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
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.primaryImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category?.name || "No Category"}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{formatPrice(product.price)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm">{product.stockQuantity} units</span>
                    {getStockBadge(product.stockQuantity)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        console.log("Navigating to View Product ID:", product.id) // Debug ID
                        router.push(ROUTES.PRODUCT_DETAIL(product.id))
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PRODUCT_EDIT(product.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}