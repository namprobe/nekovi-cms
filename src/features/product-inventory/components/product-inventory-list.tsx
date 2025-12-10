"use client"

import { useState, useEffect } from "react"
import { productInventoryService } from "@/entities/product-inventories/services/product-inventory"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { MoreHorizontal, Trash2, Package, Loader2, Edit3 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { ProductInventoryItem } from "@/entities/product-inventories/types/product-inventory"
import ProductInventoryDialog from "../product-inventory-dialog"
import { useRouter, useSearchParams } from "next/navigation"


interface ProductInventoryListProps {
    productId: string
}

export default function ProductInventoryList({ productId }: ProductInventoryListProps) {
    const { toast } = useToast()

    const [items, setItems] = useState<ProductInventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Pagination
    const searchParams = useSearchParams()
    const router = useRouter()

    const pageFromUrl = Number(searchParams.get("page") || "1")
    const [page, setPage] = useState(pageFromUrl)

    const pageSize = 3
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ProductInventoryItem | null>(null)

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await productInventoryService.getHistoryByProductId(productId, {
                page,
                pageSize
            })

            setItems(result.items || [])
            setTotalPages(result.totalPages)
            setTotalItems(result.totalItems)
        } catch (err) {
            toast({ title: "Error", description: "Failed to load inventory history", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inventory entry?")) return

        setDeletingId(id)
        try {
            await productInventoryService.delete(id)
            toast({ title: "Inventory entry deleted" })
            loadData()
        } catch (err) {
            toast({ title: "Error", description: "Unable to delete entry", variant: "destructive" })
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(page))

        router.replace(`?${params.toString()}`, { scroll: false })
    }, [page])


    useEffect(() => {
        loadData()
    }, [productId, page])

    if (loading) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading inventory history...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Entries ({totalItems})
                    </CardTitle>

                    <Button
                        onClick={() => {
                            setEditingItem(null)
                            setDialogOpen(true)
                        }}
                    >
                        + Add Entry
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entry Date</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Imported By</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="font-mono">
                                        +{item.quantity}
                                    </Badge>
                                </TableCell>

                                <TableCell>{item.importer || "System"}</TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={deletingId === item.id}
                                            >
                                                {deletingId === item.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingItem(item)
                                                    setDialogOpen(true)
                                                }}
                                            >
                                                <Edit3 className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(item.id)}
                                            >
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

                {items.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No inventory entries found
                    </div>
                )}

                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                        <Button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>

                        <span className="text-sm">
                            Page {page} / {totalPages} ({totalItems} entries)
                        </span>

                        <Button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>

            <ProductInventoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                productId={productId}
                initialData={editingItem}
                onSuccess={() => {
                    setDialogOpen(false)
                    loadData()
                }}
            />
        </Card>
    )
}
