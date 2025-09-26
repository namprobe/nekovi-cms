"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import type { Order } from "@/entities/orders/types/order"
import { OrderStatus, PaymentStatus } from "@/shared/types/common"
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Edit, Save } from "lucide-react"

interface OrderDetailProps {
  orderId: string
}

// Mock data - replace with actual API call
const mockOrderDetail: Order = {
  id: "1",
  orderNumber: "ORD-2024-001",
  userId: "user-1",
  isOneClick: false,
  guestEmail: undefined,
  guestFirstName: undefined,
  guestLastName: undefined,
  guestPhone: undefined,
  oneClickAddress: undefined,
  totalAmount: 89.97,
  discountAmount: 10.0,
  taxAmount: 7.2,
  shippingAmount: 5.99,
  finalAmount: 79.97,
  paymentStatus: PaymentStatus.Completed,
  orderStatus: OrderStatus.Processing,
  notes: "Please handle with care - fragile items",
  createdAt: new Date("2024-01-15T10:30:00Z"),
  createdBy: "user-1",
  updatedAt: new Date("2024-01-15T10:30:00Z"),
  updatedBy: "user-1",
  isDeleted: false,
  status: 1,
  orderItems: [
    {
      id: "item-1",
      orderId: "1",
      productId: "prod-1",
      quantity: 2,
      unitPrice: 29.99,
      discountAmount: 5.0,
      createdAt: new Date(),
      createdBy: "user-1",
      updatedAt: new Date(),
      updatedBy: "user-1",
      isDeleted: false,
      status: 1,
      product: {
        id: "prod-1",
        name: "Naruto Uzumaki Figure",
        primaryImage: "/naruto-figure.jpg",
      },
    },
    {
      id: "item-2",
      orderId: "1",
      productId: "prod-2",
      quantity: 1,
      unitPrice: 29.99,
      discountAmount: 5.0,
      createdAt: new Date(),
      createdBy: "user-1",
      updatedAt: new Date(),
      updatedBy: "user-1",
      isDeleted: false,
      status: 1,
      product: {
        id: "prod-2",
        name: "Attack on Titan Poster Set",
        primaryImage: "/attack-on-titan-inspired-poster.png",
      },
    },
  ],
}

const mockCustomer = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  address: "123 Main St, City, State 12345",
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatus, setEditedStatus] = useState<OrderStatus>(OrderStatus.Pending)
  const [editedNotes, setEditedNotes] = useState("")

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrderDetail)
      setEditedStatus(mockOrderDetail.orderStatus)
      setEditedNotes(mockOrderDetail.notes || "")
      setLoading(false)
    }, 1000)
  }, [orderId])

  const getOrderStatusBadge = (status: OrderStatus) => {
    const statusLabels = {
      [OrderStatus.Pending]: "Pending",
      [OrderStatus.Processing]: "Processing",
      [OrderStatus.Shipped]: "Shipped",
      [OrderStatus.Delivered]: "Delivered",
      [OrderStatus.Cancelled]: "Cancelled",
      [OrderStatus.Returned]: "Returned",
    }

    return (
      <Badge className={ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS]}>{statusLabels[status]}</Badge>
    )
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusLabels = {
      [PaymentStatus.Pending]: "Pending",
      [PaymentStatus.Completed]: "Completed",
      [PaymentStatus.Failed]: "Failed",
      [PaymentStatus.Refunded]: "Refunded",
      [PaymentStatus.Cancelled]: "Cancelled",
    }

    return (
      <Badge className={PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS]}>
        {statusLabels[status]}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handleSaveChanges = async () => {
    if (!order) return

    try {
      // TODO: Implement API call to update order
      console.log("Updating order:", {
        orderId: order.id,
        orderStatus: editedStatus,
        notes: editedNotes,
      })

      // Update local state for demo
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: editedStatus,
              notes: editedNotes,
            }
          : null,
      )

      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Processing:
        return <Package className="h-4 w-4" />
      case OrderStatus.Shipped:
        return <Truck className="h-4 w-4" />
      case OrderStatus.Delivered:
        return <CheckCircle className="h-4 w-4" />
      case OrderStatus.Cancelled:
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.ORDERS)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.orderStatus)}
          {getOrderStatusBadge(order.orderStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.product?.primaryImage || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Unit Price: {formatPrice(item.unitPrice)}</p>
                      {item.discountAmount > 0 && (
                        <p className="text-sm text-green-600">Discount: -{formatPrice(item.discountAmount)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.quantity * item.unitPrice - item.discountAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status & Notes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Order Status</Label>
                {isEditing ? (
                  <Select
                    value={editedStatus.toString()}
                    onValueChange={(value) => setEditedStatus(Number.parseInt(value) as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.Pending.toString()}>Pending</SelectItem>
                      <SelectItem value={OrderStatus.Processing.toString()}>Processing</SelectItem>
                      <SelectItem value={OrderStatus.Shipped.toString()}>Shipped</SelectItem>
                      <SelectItem value={OrderStatus.Delivered.toString()}>Delivered</SelectItem>
                      <SelectItem value={OrderStatus.Cancelled.toString()}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>{getOrderStatusBadge(order.orderStatus)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes about this order..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">{order.notes || "No notes added"}</p>
                )}
              </div>

              {isEditing && (
                <Button onClick={handleSaveChanges} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{mockCustomer.name}</p>
                <p className="text-sm text-gray-600">{mockCustomer.email}</p>
                <p className="text-sm text-gray-600">{mockCustomer.phone}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-700">Shipping Address</p>
                <p className="text-sm text-gray-600">{mockCustomer.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.totalAmount - order.taxAmount - order.shippingAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(order.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.orderStatus >= OrderStatus.Processing && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-xs text-gray-500">Order is being prepared</p>
                    </div>
                  </div>
                )}
                {order.orderStatus >= OrderStatus.Shipped && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Shipped</p>
                      <p className="text-xs text-gray-500">Order has been shipped</p>
                    </div>
                  </div>
                )}
                {order.orderStatus >= OrderStatus.Delivered && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-gray-500">Order has been delivered</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
