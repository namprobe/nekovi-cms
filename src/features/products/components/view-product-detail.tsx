"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProductDetail } from "@/features/products/hooks/use-products"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Calendar, DollarSign, Package, Star, Tag, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ROUTES } from "@/core/config/routes"

interface ViewProductDetailProps {
    productId: string
}

export function ViewProductDetail({ productId }: ViewProductDetailProps) {
    const { item: product, loading, error } = useProductDetail(productId)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (!loading && error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive",
            })
            router.push(ROUTES.PRODUCTS)
        }
    }, [loading, error, toast, router])



    if (loading) return <div>Loading...</div>
    if (error || !product) return null

    const formatDate = (date: Date | string | undefined) =>
        date ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date)) : "N/A"

    const formatPrice = (price: number | undefined) =>
        price !== undefined
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
            : "N/A"

    return (
        <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <Card>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Category:</span> {product.category?.name || "N/A"}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Anime Series:</span> {product.animeSeries?.title || "N/A"}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Tags:</span>
                            {product.productTags?.length ? (
                                product.productTags.map((pt, index: number) => (
                                    <Badge key={index} variant="outline" className="ml-1">
                                        {pt.tag?.name || "N/A"}
                                    </Badge>
                                ))
                            ) : (
                                "N/A"
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Stock Quantity:</span> {product.stockQuantity}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Price:</span> {formatPrice(product.price)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Discount Price:</span> {formatPrice(product.discountPrice)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Created At:</span> {formatDate(product.createdAt)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Is Pre-Order:</span> {product.isPreOrder ? "Yes" : "No"}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Pre-Order Release Date:</span> {formatDate(product.preOrderReleaseDate)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4" />
                            <span className="font-medium">Average Rating:</span> {product.averageRating.toFixed(2)} / 5
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Total Sales:</span> {product.totalSales}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground mt-2">{product.description || "No description available"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Ảnh sản phẩm */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product.images?.length ? (
                            product.images.map((img, index: number) => (
                                <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={img.imagePath || "/placeholder.svg"}
                                        alt={`Product image ${index + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                    {img.isPrimary && (
                                        <Badge className="absolute top-2 left-2">Primary</Badge>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Reviews ({product.reviews?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {product.reviews?.length ? (
                        product.reviews.map((review, index: number) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">{review.userName || "Anonymous"}</span>
                                    <Badge variant="secondary">{review.rating} / 5</Badge>
                                </div>
                                <h4 className="font-semibold">{review.title || "No title"}</h4>
                                <p className="text-muted-foreground">{review.comment || "No comment"}</p>
                            </Card>
                        ))
                    ) : (
                        <p>No reviews available</p>
                    )}
                </CardContent>
            </Card>

            {/* Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Related Events ({product.events?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Image</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.events?.length ? (
                                product.events.map((event, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{event.name}</TableCell>
                                        <TableCell>{formatDate(event.startDate)}</TableCell>
                                        <TableCell>{formatDate(event.endDate)}</TableCell>
                                        <TableCell>
                                            {event.imagePath ? (
                                                <img
                                                    src={event.imagePath}
                                                    alt={event.name}
                                                    className="rounded w-[50px] h-[50px] object-cover"
                                                />
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>No events available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}