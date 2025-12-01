// src/features/products/components/product-list.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Search, History, PackagePlus } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { productService } from "@/entities/products/services/product"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"   // ← Import hook
import ProductInventoryDialog from "@/features/product-inventory/product-inventory-dialog"

export default function ProductList() {
  const router = useRouter()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // State
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  // Search state
  const [searchTerm, setSearchTerm] = useState("")                    // ← UI input
  const debouncedSearch = useDebounce(searchTerm, 400)                // ← Debounced value

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    const urlPage = Number(searchParams.get("page") || 1)

    setSearchTerm(urlSearch)
    setPage(urlPage)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm) params.set("search", searchTerm)
    if (page) params.set("page", String(page))

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchTerm, page])

  // Fetch function
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await productService.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
      })

      if (res.isSuccess) {
        setProducts(res.items)
        setTotal(res.totalItems)
      } else {
        setProducts([])
        setTotal(0)
        const errorMessage = (res as any)?.message ?? "Failed to load products"
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Gọi API khi page hoặc debouncedSearch thay đổi
  useEffect(() => {
    fetchProducts()
  }, [page, debouncedSearch])


  // Focus lại input sau khi loading xong
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

  // Xóa sản phẩm
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await productService.deleteProduct(id)
      toast({ title: "Success", description: "Product deleted successfully" })
      fetchProducts()
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" })
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
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)


  if (loading && products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
              ref={searchInputRef}
              placeholder="Search products by name, category..."
              value={searchTerm}
              // ✅ SỬA LẠI ĐOẠN NÀY
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
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.primaryImage || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="font-medium">{product.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category?.name || "No Category"}</Badge>
                </TableCell>
                <TableCell>
                  {product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price ? (
                    <div className="flex items-end gap-2 flex-wrap">
                      {/* Giá gốc - bị gạch ngang */}
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>

                      {/* Giá thực tế khách trả = price - discountPrice */}
                      <span className="font-bold text-lg text-red-600">
                        {formatPrice(product.price - product.discountPrice)}
                      </span>

                      {/* Badge giảm giá - ưu tiên % nếu >=5%, không thì hiện số tiền giảm */}
                      <Badge variant="destructive" className="text-xs">
                        {(() => {
                          const discountAmount = product.discountPrice
                          const discountPercent = Math.round((discountAmount / product.price) * 100)

                          return `- ${formatPrice(discountAmount).replace("₫", "").trim()}₫`

                        })()}
                      </Badge>
                    </div>
                  ) : (
                    /* Không có giảm giá */
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  )}
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
                        setSelectedProductId(product.id)
                        setCreateDialogOpen(true)
                      }}>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Import goods
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PRODUCT_INVENTORY_LIST(product.id))}>
                        <History className="mr-2 h-4 w-4" />
                        Import history
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}>
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

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No products found for your search." : "No products yet."}
          </div>
        )}

        {total > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <Button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {Math.ceil(total / limit)} ({total} products)
            </span>
            <Button disabled={page * limit >= total || loading} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </CardContent>

      <ProductInventoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        productId={selectedProductId ?? ""}
        onSuccess={() => {
          setCreateDialogOpen(false)
          toast({ title: "Nhập kho thành công!" })
          fetchProducts()
        }}
      />
    </Card>
  )
}