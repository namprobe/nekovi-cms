"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import { ArrowLeft, Loader2, Package, Truck, CreditCard, Tag } from "lucide-react"
import { useOrderStore } from "@/entities/orders/model/order-store"
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/entities/orders/lib/constants"
import { formatCurrency, formatDate } from "@/shared/lib/utils"
import { orderApi, type ShippingHistoryDto } from "@/entities/orders/api/order-api"

interface OrderDetailViewProps {
  orderId: string
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter()
  const {
    selectedOrder: order,
    isLoadingDetail: isLoading,
    detailError: error,
    fetchOrderById,
    clearSelectedOrder,
  } = useOrderStore()

  const [shippingHistory, setShippingHistory] = useState<ShippingHistoryDto[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
    }

    return () => {
      clearSelectedOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]) // Only depend on orderId to prevent duplicate calls

  // Fetch shipping history
  useEffect(() => {
    if (orderId) {
      setIsLoadingHistory(true)
      orderApi
        .getShippingHistory(orderId)
        .then((result) => {
          if (result.isSuccess && result.data) {
            setShippingHistory(result.data)
          }
        })
        .catch(() => {
          // Silently fail - shipping history is optional
        })
        .finally(() => {
          setIsLoadingHistory(false)
        })
    }
  }, [orderId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-destructive">{error || "Order not found"}</p>
        <Button onClick={() => router.push("/dashboard/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/orders")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={ORDER_STATUS_COLORS[order.orderStatus]}>
            {ORDER_STATUS_LABELS[order.orderStatus]}
          </Badge>
          <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.userName && (
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{order.userName}</p>
              </div>
            )}
            {order.userEmail && (
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{order.userEmail}</p>
              </div>
            )}
            {order.guestName && (
              <div>
                <span className="text-sm text-muted-foreground">Guest Name:</span>
                <p className="font-medium">{order.guestName}</p>
              </div>
            )}
            {order.guestEmail && (
              <div>
                <span className="text-sm text-muted-foreground">Guest Email:</span>
                <p className="font-medium">{order.guestEmail}</p>
              </div>
            )}
            {order.guestPhone && (
              <div>
                <span className="text-sm text-muted-foreground">Phone:</span>
                <p className="font-medium">{order.guestPhone}</p>
              </div>
            )}
            {order.oneClickAddress && (
              <div>
                <span className="text-sm text-muted-foreground">Address:</span>
                <p className="font-medium">{order.oneClickAddress}</p>
              </div>
            )}
            {order.isOneClick && (
              <Badge variant="secondary">One-Click Order</Badge>
            )}
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Order Date:</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total Items:</span>
              <p className="font-medium">{order.itemCount} items</p>
            </div>
            {order.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.productImageUrl && (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
                  {item.unitDiscountAmount > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.unitPriceOriginal * item.quantity)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.unitPriceAfterDiscount)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shipping Info */}
        {order.shipping && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Method:</span>
                <p className="font-medium">{order.shipping.shippingMethodName}</p>
              </div>
              {order.shipping.providerName && (
                <div>
                  <span className="text-sm text-muted-foreground">Provider:</span>
                  <p className="font-medium">{order.shipping.providerName}</p>
                </div>
              )}
              {order.shipping.trackingNumber && (
                <div>
                  <span className="text-sm text-muted-foreground">Tracking:</span>
                  <p className="font-mono font-medium">{order.shipping.trackingNumber}</p>
                </div>
              )}
              {(order.shipping.recipientName || order.shipping.address) && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <span className="text-sm font-semibold text-muted-foreground">Delivery Address:</span>
                  </div>
                  {order.shipping.recipientName && (
                    <div>
                      <span className="text-sm text-muted-foreground">Recipient:</span>
                      <p className="font-medium">{order.shipping.recipientName}</p>
                    </div>
                  )}
                  {order.shipping.recipientPhone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <p className="font-medium">{order.shipping.recipientPhone}</p>
                    </div>
                  )}
                  {order.shipping.address && (
                    <div>
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <p className="font-medium">
                        {order.shipping.address}
                        {order.shipping.wardName && `, ${order.shipping.wardName}`}
                        {order.shipping.districtName && `, ${order.shipping.districtName}`}
                        {order.shipping.provinceName && `, ${order.shipping.provinceName}`}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="border-t pt-3 mt-3">
                <span className="text-sm font-semibold text-muted-foreground">Delivery Tracking:</span>
              </div>
              {order.shipping.shippedDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Shipped:</span>
                  <p className="font-medium">{formatDate(order.shipping.shippedDate)}</p>
                </div>
              )}
              {order.shipping.estimatedDeliveryDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Est. Delivery:</span>
                  <p className="font-medium">{formatDate(order.shipping.estimatedDeliveryDate)}</p>
                </div>
              )}
              {order.shipping.deliveredDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Delivered:</span>
                  <p className="font-medium">{formatDate(order.shipping.deliveredDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        {order.payment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Method:</span>
                <p className="font-medium">{order.payment.paymentMethodName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Amount:</span>
                <p className="font-medium">{formatCurrency(order.payment.amount)}</p>
              </div>
              {order.payment.transactionNo && (
                <div>
                  <span className="text-sm text-muted-foreground">Transaction:</span>
                  <p className="font-mono font-medium">{order.payment.transactionNo}</p>
                </div>
              )}
              {order.payment.paymentDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Payment Date:</span>
                  <p className="font-medium">{formatDate(order.payment.paymentDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Applied Coupons */}
      {order.appliedCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Applied Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.appliedCoupons.map((coupon) => (
                <div key={coupon.couponId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{coupon.couponCode}</p>
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    -{coupon.discountType === 1 ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal (Original):</span>
              <span>{formatCurrency(order.subtotalOriginal)}</span>
            </div>
            {order.productDiscountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Product Discount:</span>
                <span>-{formatCurrency(order.productDiscountAmount)}</span>
              </div>
            )}
            {order.couponDiscountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Coupon Discount:</span>
                <span>-{formatCurrency(order.couponDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Subtotal After Discount:</span>
              <span>{formatCurrency(order.totalProductAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span>{formatCurrency(order.shippingFeeActual)}</span>
            </div>
            {order.shippingDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping Discount:</span>
                <span>-{formatCurrency(order.shippingDiscountAmount)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping History Timeline */}
      {order.shipping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipping History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : shippingHistory.length > 0 ? (
              <div className="space-y-4">
                {shippingHistory.map((event, index) => (
                  <div
                    key={event.id}
                    className="relative border-l-2 border-primary pl-4 pb-4 last:border-l-0 last:pb-0"
                  >
                    <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary"></div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.statusDescription}</p>
                        <p className="text-xs text-muted-foreground">{event.statusName}</p>
                        {event.eventType && (
                          <p className="text-xs text-muted-foreground">Type: {event.eventType}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.eventTime)}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {event.statusCode}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No shipping history available for this order yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

