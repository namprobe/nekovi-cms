"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { ProductListItem } from "@/entities/products/types/product"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react"

// Mock data - replace with actual API call
const mockProducts: ProductListItem[] = [
  {
    id: "1",
    name: "Naruto Uzumaki Figure",
    price: 29.99,
    discountPrice: 24.99,
    stockQuantity: 15,
    categoryName: "Figures",
    animeSeriesTitle: "Naruto",
    primaryImage: "/naruto-figure.jpg",
    status: 1,
    isPreOrder: false,
  },
  {
    id: "2",
    name: "Attack on Titan Poster Set",
    price: 19.99,
    stockQuantity: 0,
    categoryName: "Posters",
    animeSeriesTitle: "Attack on Titan",
    primaryImage: "/attack-on-titan-inspired-poster.png",
    status: 1,
    isPreOrder: false,
  },
  {
    id: "3",
    name: "One Piece Luffy Nendoroid",
    price: 49.99,
    stockQuantity: 8,
    categoryName: "Nendoroids",
    animeSeriesTitle: "One Piece",
    primaryImage: "/luffy-nendoroid.jpg",
    status: 1,
    isPreOrder: true,
  },
  {
    id: "4",
    name: "Dragon Ball Z Goku Statue",
    price: 89.99,
    discountPrice: 79.99,
    stockQuantity: 3,
    categoryName: "Statues",
    animeSeriesTitle: "Dragon Ball Z",
    primaryImage: "/goku-statue.jpg",
    status: 0,
    isPreOrder: false,
  },
]

const categories = [
  { value: "all", label: "All Categories" },
  { value: "figures", label: "Figures" },
  { value: "nendoroids", label: "Nendoroids" },
  { value: "statues", label: "Statues" },
  { value: "posters", label: "Posters" },
]

export function ProductList() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.animeSeriesTitle && product.animeSeriesTitle.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.categoryName.toLowerCase() === selectedCategory.toLowerCase())
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="error">Out of Stock</Badge>
    } else if (quantity <= 5) {
      return <Badge variant="warning">Low Stock</Badge>
    }
    return <Badge variant="success">In Stock</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
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
          <CardTitle>Products</CardTitle>
          <Button onClick={() => router.push(ROUTES.PRODUCT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
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
              <TableHead>Type</TableHead>
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
                      {product.animeSeriesTitle && (
                        <div className="text-sm text-gray-500">{product.animeSeriesTitle}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.categoryName}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {product.discountPrice ? (
                      <>
                        <span className="font-medium text-green-600">{formatPrice(product.discountPrice)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-medium">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm">{product.stockQuantity} units</span>
                    {getStockBadge(product.stockQuantity)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  {product.isPreOrder ? (
                    <Badge className="bg-purple-100 text-purple-800">Pre-order</Badge>
                  ) : (
                    <Badge variant="outline">Regular</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}>
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
