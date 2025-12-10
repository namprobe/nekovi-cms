// src/features/products/components/view-product-detail.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProductDetail } from "@/features/products/hooks/use-products"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Calendar, DollarSign, Package, Star, Tag, User, TrendingUp, Zap } from "lucide-react" // Đã thêm Zap
import { useToast } from "@/hooks/use-toast"
import { ROUTES } from "@/core/config/routes"
import { JSX } from "react/jsx-runtime"
import { Separator } from "@/shared/ui/separator"

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

    if (loading) return <div className="text-center py-10">Loading...</div>
    if (error || !product) return null

    const formatDate = (date?: Date | string) =>
        date ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(date)) : "N/A"

    const formatPrice = (price?: number) =>
        price !== undefined
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
            : "N/A"

    // ========================================================
    // === LOGIC TÍNH TOÁN GIÁ (Đã cập nhật theo yêu cầu) ===
    // ========================================================
    const originalPrice = product.price || 0;

    // 1. discountPrice là giá sau khi đã giảm (nếu có)
    const hasFixedDiscount = product.discountPrice != null && product.discountPrice > 0;
    const basePrice = hasFixedDiscount ? product.discountPrice! : originalPrice;

    // 2. Event Discount Percentage tính trên giá gốc
    const eventPercent = product.eventDiscountPercentage || 0;
    const eventDeduction = (originalPrice * eventPercent) / 100;

    // 3. Final Price
    const finalPrice = Math.max(0, basePrice - eventDeduction);
    const isDiscounted = finalPrice < originalPrice;
    // ========================================================

    const InfoRow = ({
        icon,
        label,
        value,
        isMultiple = false,
    }: {
        icon: JSX.Element
        label: string
        value: React.ReactNode
        isMultiple?: boolean
    }) => (
        <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {icon}
            <span className="font-medium">{label}:</span>
            {isMultiple ? (
                <div className="flex flex-wrap space-x-1">{value}</div>
            ) : (
                <span>{value}</span>
            )}
        </div>
    )

    const BasicInfo = () => (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                    label="Category"
                    value={product.category?.name ?? "N/A"}
                />
                <InfoRow
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                    label="Anime Series"
                    value={product.animeSeries?.title ?? "N/A"}
                />
                <InfoRow
                    icon={<Package className="h-4 w-4 text-muted-foreground" />}
                    label="Stock Quantity"
                    value={product.stockQuantity?.toString() ?? "N/A"}
                />

                {/* Hiển thị rõ giá cố định đã giảm (nếu có) */}
                <InfoRow
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    label="Fixed Price"
                    value={
                        hasFixedDiscount
                            ? <span className="text-gray-700">{formatPrice(product.discountPrice!)} <span className="text-xs text-muted-foreground">(Discounted)</span></span>
                            : <span className="text-gray-500">None</span>
                    }
                />

                {/* Hiển thị % giảm sự kiện */}
                <InfoRow
                    icon={<Zap className="h-4 w-4 text-yellow-500" />}
                    label="Event Discount"
                    value={
                        eventPercent > 0
                            ? <span className="text-yellow-600 font-bold">-{eventPercent}% (on Orig. Price)</span>
                            : <span className="text-gray-500">None</span>
                    }
                />

                <InfoRow
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    label="Created At"
                    value={formatDate(product.createdAt)}
                />
                <InfoRow
                    icon={<Package className="h-4 w-4 text-muted-foreground" />}
                    label="Is Pre-Order"
                    value={
                        product.isPreOrder ? (
                            <Badge variant="secondary" className="text-xs">Yes</Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                        )
                    }
                />
                <InfoRow
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    label="Pre-Order Release"
                    value={formatDate(product.preOrderReleaseDate)}
                />
            </div>

            <Separator className="my-3" />

            <div>
                <InfoRow
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                    label="Tags"
                    value={
                        product.productTags?.length ? (
                            <div className="flex flex-wrap gap-1">
                                {product.productTags.map((pt, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                                    >
                                        {pt.tag?.name ?? "N/A"}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )
                    }
                    isMultiple
                />
            </div>
        </div>
    )

    // 🔥 Highlight Stats: Hiển thị giá cuối cùng (Final Price)
    const HighlightStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 rounded-xl shadow-sm border">
                <DollarSign className="h-6 w-6 text-emerald-600 mb-1" />
                <span className="text-sm text-muted-foreground">Current Price</span>

                {/* Giá cuối cùng */}
                <span className="text-xl font-bold text-emerald-700">{formatPrice(finalPrice)}</span>

                {/* Giá gốc gạch ngang nếu có giảm */}
                {isDiscounted && (
                    <span className="text-xs text-muted-foreground line-through mt-1">
                        Original: {formatPrice(originalPrice)}
                    </span>
                )}
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-50 p-4 rounded-xl shadow-sm border">
                <Star className="h-6 w-6 text-amber-500 mb-1" />
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <span className="text-xl font-bold text-amber-700">
                    {product.averageRating.toFixed(2)} / 5
                </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-4 rounded-xl shadow-sm border">
                <TrendingUp className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-sm text-muted-foreground">Total Sales</span>
                <span className="text-xl font-bold text-blue-700">
                    {product.totalSales?.toLocaleString() ?? "0"}
                </span>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <HighlightStats />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BasicInfo />
                        <div>
                            <span className="font-medium block mb-2">Description:</span>
                            <p className="text-muted-foreground">{product.description ?? "No description available"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product.images?.length ? (
                            product.images.map((img, i) => (
                                <div key={i} className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={img.imagePath ?? "/placeholder.svg"}
                                        alt={`${product.name} image ${i + 1}`}
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                    />
                                    {img.isPrimary && <Badge className="absolute top-2 left-2">Primary</Badge>}
                                </div>
                            ))
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Product Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Reviews ({product.reviews?.length ?? 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {product.reviews?.length ? (
                        product.reviews.map((review, i) => (
                            <Card key={i} className="p-4 border border-gray-200 rounded">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">{review.userName ?? "Anonymous"}</span>
                                    <Badge variant="secondary">{review.rating} / 5</Badge>
                                </div>
                                <h4 className="font-semibold">{review.title ?? "No title"}</h4>
                                <p className="text-muted-foreground">{review.comment ?? "No comment"}</p>
                            </Card>
                        ))
                    ) : (
                        <p>No reviews available</p>
                    )}
                </CardContent>
            </Card>

            {/* Related Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Related Events ({product.events?.length ?? 0})</CardTitle>
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
                                product.events.map((event, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{event.name}</TableCell>
                                        <TableCell>{formatDate(event.startDate)}</TableCell>
                                        <TableCell>{formatDate(event.endDate)}</TableCell>
                                        <TableCell>
                                            {event.imagePath ? (
                                                <img
                                                    src={event.imagePath}
                                                    alt={event.name}
                                                    className="rounded w-[50px] h-[50px] object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No events available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}