"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { AsyncMultiSelect } from "@/shared/ui/selects/async-multi-select"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Loader2, Trash2, Save, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { eventProductService } from "@/entities/event-product/services/event-product"
import { productService } from "@/entities/products/services/product"
import type { EventProductFormItem } from "@/entities/event-product/types/event-product"

interface EventProductModalProps {
    isOpen: boolean
    onClose: () => void
    eventId: string
    eventTitle: string
}

export function EventProductModal({ isOpen, onClose, eventId, eventTitle }: EventProductModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [items, setItems] = useState<EventProductFormItem[]>([])

    useEffect(() => {
        if (isOpen && eventId) {
            fetchData()
        } else {
            setItems([])
        }
    }, [isOpen, eventId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await eventProductService.getByEventId(eventId)
            if (res.isSuccess && res.data) {
                const mappedItems: EventProductFormItem[] = res.data.map((ep) => ({
                    productId: ep.product.id,
                    productName: ep.product.name,
                    productImage: ep.product.images?.find((i) => i.isPrimary)?.imagePath || "",
                    originalPrice: ep.product.price,
                    // Lấy giá giảm gốc, nếu null thì = 0
                    productDiscountPrice: ep.product.discountPrice || 0,
                    isFeatured: ep.isFeatured,
                    discountPercentage: ep.discountPercentage,
                }))
                setItems(mappedItems)
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to load event products", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAddProducts = async (newIds: string[]) => {
        const idsToAdd = newIds.filter((id) => !items.some((item) => item.productId === id))

        if (idsToAdd.length === 0) return

        const newItems: EventProductFormItem[] = []

        for (const id of idsToAdd) {
            try {
                const res = await productService.getProductById(id)
                if (res.isSuccess && res.data) {
                    const p = res.data
                    newItems.push({
                        productId: p.id,
                        productName: p.name,
                        productImage: p.images?.find((i: any) => i.isPrimary)?.imagePath || "",
                        originalPrice: p.price,
                        productDiscountPrice: p.discountPrice || 0, // Mặc định 0 nếu null
                        isFeatured: false,
                        discountPercentage: 0,
                    })
                }
            } catch (e) {
                console.error(`Failed to fetch product ${id}`, e)
            }
        }

        setItems((prev) => [...prev, ...newItems])
    }

    const updateItem = (productId: string, field: keyof EventProductFormItem, value: any) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.productId === productId) {
                    if (field === "discountPercentage") {
                        const num = Number(value)
                        if (num < 0) value = 0
                        if (num > 100) value = 100
                    }
                    return { ...item, [field]: value }
                }
                return item
            })
        )
    }

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const payload = items.map((item) => ({
                productId: item.productId,
                isFeatured: item.isFeatured,
                discountPercentage: Number(item.discountPercentage),
            }))

            const res = await eventProductService.saveEventProducts(eventId, payload)

            if (res.isSuccess) {
                toast({ title: "Success", description: "Event products saved successfully" })
                onClose()
            } else {
                toast({ title: "Error", description: res.message || "Failed to save", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const fetchProductOptions = async (search: string) => {
        const res = await productService.getSelectList(search)
        if (res.isSuccess && res.data) {
            return res.data.map((p) => ({ id: p.id, label: p.name }))
        }
        return []
    }

    // Helper format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 1. Đảm bảo DialogContent hiển thị flex column để footer luôn ở đáy */}
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0"> {/* Có thể dùng h-[90vh] để cố định chiều cao modal luôn lớn, hoặc max-h-[90vh] */}
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Manage Products for: {eventTitle}</DialogTitle>
                </DialogHeader>

                {/* 2. Container chính: Thêm 'min-h-0' để flex-1 hoạt động đúng khi co lại */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden p-6 min-h-0">
                    <div className="flex flex-col gap-2">
                        <Label>Add Products</Label>
                        <AsyncMultiSelect
                            value={[]}
                            onChange={handleAddProducts}
                            fetchOptions={fetchProductOptions}
                            placeholder="Search and select products to add..."
                        />
                    </div>

                    {/* 3. Container chứa Table: Thêm 'min-h-0' */}
                    <div className="flex-1 border rounded-md relative overflow-hidden flex flex-col min-h-0">
                        {/* Header Table cố định */}
                        <div className="bg-muted/50 border-b z-10">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]">Product</TableHead>
                                        <TableHead className="w-[12%] text-right">Price</TableHead>
                                        <TableHead className="w-[12%] text-right">Base Disc.</TableHead>
                                        <TableHead className="w-[15%] text-center">Event Disc. (%)</TableHead>
                                        <TableHead className="w-[15%] text-right">New Price</TableHead>
                                        <TableHead className="w-[10%] text-center">Featured</TableHead>
                                        <TableHead className="w-[6%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>
                        </div>

                        {/* 4. ScrollArea: Thêm 'h-full' để đảm bảo nó chiếm toàn bộ không gian còn lại */}
                        <ScrollArea className="flex-1 h-full w-full">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No products added yet.
                                </div>
                            ) : (
                                <Table>
                                    <TableBody>
                                        {items.map((item) => {
                                            const basePrice = item.productDiscountPrice > 0 ? item.productDiscountPrice : item.originalPrice
                                            const eventDiscountAmount = (item.originalPrice * item.discountPercentage) / 100
                                            const finalPrice = basePrice - eventDiscountAmount
                                            const displayPrice = finalPrice > 0 ? finalPrice : 0

                                            return (
                                                <TableRow key={item.productId}>
                                                    <TableCell className="w-[30%] align-middle">
                                                        <div className="font-medium line-clamp-2" title={item.productName}>
                                                            {item.productName}
                                                        </div>
                                                        {item.productDiscountPrice > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                (Has product discount)
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="w-[12%] text-right align-middle text-muted-foreground line-through">
                                                        {formatCurrency(item.originalPrice)}
                                                    </TableCell>

                                                    <TableCell className="w-[12%] text-right align-middle font-medium">
                                                        {item.productDiscountPrice > 0
                                                            ? formatCurrency(item.productDiscountPrice)
                                                            : "-"
                                                        }
                                                    </TableCell>

                                                    <TableCell className="w-[15%] align-middle">
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    className="w-16 h-8 text-center"
                                                                    value={item.discountPercentage}
                                                                    onChange={(e) => updateItem(item.productId, "discountPercentage", e.target.value)}
                                                                />
                                                                <span className="text-sm text-muted-foreground">%</span>
                                                            </div>

                                                            {item.discountPercentage > 0 && (
                                                                <div className="text-[10px] text-red-500 font-medium">
                                                                    -{formatCurrency(eventDiscountAmount)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[15%] text-right align-middle font-bold text-green-600">
                                                        {formatCurrency(displayPrice)}
                                                    </TableCell>

                                                    <TableCell className="w-[10%] align-middle">
                                                        <div className="flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => updateItem(item.productId, "isFeatured", !item.isFeatured)}
                                                                className={item.isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-gray-400"}
                                                            >
                                                                <Star className={`h-5 w-5 ${item.isFeatured ? "fill-yellow-500" : ""}`} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[6%] align-middle">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeItem(item.productId)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-background">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}