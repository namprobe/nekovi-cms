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
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Search, History, PackagePlus, Zap } from "lucide-react" // Đã thêm Zap
import { ROUTES } from "@/core/config/routes"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { productService } from "@/entities/products/services/product"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import ProductInventoryDialog from "@/features/product-inventory/product-inventory-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

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
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 400)
  const [stockStatus, setStockStatus] = useState<"" | "all" | "in-stock" | "low-stock" | "out-of-stock">("")

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    const urlPage = Number(searchParams.get("page") || 1)
    const urlStockStatus = searchParams.get("stockStatus") || ""

    setSearchTerm(urlSearch)
    setPage(urlPage)
    setStockStatus(urlStockStatus === "all" ? "" : (urlStockStatus as "in-stock" | "low-stock" | "out-of-stock"))
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm) params.set("search", searchTerm)
    if (page) params.set("page", String(page))
    if (stockStatus && stockStatus !== "all") params.set("stockStatus", stockStatus)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchTerm, page, stockStatus])

  // Fetch function
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await productService.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        stockStatus: stockStatus === "all" || stockStatus === "" ? undefined : (stockStatus as "in-stock" | "low-stock" | "out-of-stock"),
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

  useEffect(() => {
    fetchProducts()
  }, [page, debouncedSearch, stockStatus])

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

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
    if (quantity <= 10) return <Badge variant="warning">Low Stock</Badge>
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
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>

          <Select value={stockStatus} onValueChange={(value) => {
            setStockStatus(value as "" | "all" | "in-stock" | "low-stock" | "out-of-stock")
            setPage(1)
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">In Stock</Badge>
                  <span>In Stock (&gt;10)</span>
                </div>
              </SelectItem>
              <SelectItem value="low-stock">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="text-xs">Low Stock</Badge>
                  <span>Low Stock (1–10)</span>
                </div>
              </SelectItem>
              <SelectItem value="out-of-stock">
                <div className="flex items-center gap-2">
                  <Badge variant="error" className="text-xs">Out of Stock</Badge>
                  <span>Out of Stock (0)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
            {products.map((product) => {
              // ========================================================
              // === LOGIC TÍNH GIÁ HIỂN THỊ ===
              // ========================================================
              const originalPrice = product.price; // Giá gốc (Price)

              // 1. Xác định giá đã giảm cố định (nếu có)
              // discountPrice là giá SAU KHI giảm (ví dụ: gốc 100k, giảm còn 90k -> discountPrice = 90k)
              const hasFixedDiscount = product.discountPrice != null && product.discountPrice > 0;
              const basePrice = hasFixedDiscount ? product.discountPrice : originalPrice;

              // 2. Tính tiền giảm thêm từ sự kiện (theo % của giá GỐC)
              const eventPercent = product.eventDiscountPercentage || 0;
              const eventDeductionAmount = (originalPrice * eventPercent) / 100;

              // 3. Giá hiển thị cuối cùng = Base - EventDeduction
              const finalPrice = Math.max(0, basePrice - eventDeductionAmount);

              const isDiscounted = finalPrice < originalPrice;
              // ========================================================

              return (
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
                    {isDiscounted ? (
                      <div className="flex flex-col gap-1 items-start">
                        {/* Giá gốc gạch ngang */}
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>

                        {/* Giá cuối cùng */}
                        <span className="font-bold text-red-600">
                          {formatPrice(finalPrice)}
                        </span>

                        {/* Badges chi tiết */}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {hasFixedDiscount && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-gray-200 text-gray-700">
                              Sale
                            </Badge>
                          )}
                          {eventPercent > 0 && (
                            <Badge className="text-[10px] h-5 px-1 bg-yellow-500 text-white hover:bg-yellow-600 border-none">
                              <Zap className="w-3 h-3 mr-0.5 fill-current" />
                              -{eventPercent}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="font-medium">{formatPrice(originalPrice)}</span>
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
              );
            })}
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