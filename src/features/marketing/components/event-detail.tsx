"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/shared/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
    Calendar,
    MapPin,
    ArrowLeft,
    Package,
    DollarSign,
    Clock,
} from "lucide-react"
import { eventService } from "@/entities/event/services/event"
import type { EventResponse } from "@/entities/event/types/event"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { useToast } from "@/hooks/use-toast"

interface EventDetailProps {
    eventId: string
}

export default function EventDetail({ eventId }: EventDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [event, setEvent] = useState<EventResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (eventId) fetchEvent(eventId)
    }, [eventId])

    const fetchEvent = async (id: string) => {
        try {
            setLoading(true)
            const response = await eventService.getEventById(id)
            if (response.isSuccess && response.data) {
                setEvent(response.data as EventResponse)
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to load event",
                    variant: "destructive",
                })
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to load event",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: number) => {
        const text = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
        return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{text}</Badge>
    }

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>
        if (quantity <= 5) return <Badge variant="warning">Low Stock</Badge>
        return <Badge variant="success">In Stock</Badge>
    }

    const formatDate = (date: string | Date) =>
        new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date))

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)

    if (loading)
        return <div className="text-center py-12 text-muted-foreground">Loading event details...</div>

    if (!event)
        return (
            <Card className="border-dashed border-muted-foreground/20">
                <CardContent className="p-8 text-center text-muted-foreground">
                    Event not found.
                </CardContent>
            </Card>
        )

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Back button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                </Button>
            </div>

            {/* Event Overview */}
            <Card className="overflow-hidden shadow-sm">
                <div className="grid md:grid-cols-3 gap-0">
                    {/* Image */}
                    <div className="relative md:col-span-1">
                        <img
                            src={event.imagePath || "/placeholder.svg"}
                            alt={event.name}
                            className="object-cover w-full h-64 md:h-full"
                        />
                        <div className="absolute top-4 left-4">{getStatusBadge(event.status)}</div>
                    </div>

                    {/* Info */}
                    <div className="md:col-span-2 p-6 space-y-4">
                        <div>
                            <CardTitle className="text-2xl font-semibold">{event.name}</CardTitle>
                            <CardDescription className="mt-1 text-base">
                                {event.description || "No description provided."}
                            </CardDescription>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(event.startDate)} — {formatDate(event.endDate)}</span>
                            </div>

                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>
                                Duration:{" "}
                                {Math.max(
                                    1,
                                    Math.ceil(
                                        (new Date(event.endDate).getTime() -
                                            new Date(event.startDate).getTime()) /
                                        (1000 * 3600 * 24)
                                    )
                                )}{" "}
                                day(s)
                            </span>
                        </div>


                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location || "No location"}</span>
                        </div>

                    </div>
                </div>
            </Card>

            {/* Products Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span>Event Products</span>
                        </CardTitle>
                        <Badge variant="outline">{event.products?.length ?? 0} items</Badge>
                    </div>
                    <CardDescription>
                        Products participating in <strong>{event.name}</strong>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {event.products && event.products.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-border/50">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {event.products.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                        <img
                                                            src={p.primaryImage || "/placeholder.svg"}
                                                            alt={p.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            #{p.id.slice(0, 6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{p.category?.name || "—"}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatPrice(p.price)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-sm">{p.stockQuantity} units</span>
                                                    {getStockBadge(p.stockQuantity)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(p.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No products found for this event.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
