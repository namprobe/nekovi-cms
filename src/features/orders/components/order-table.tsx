"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Loader2, Eye } from "lucide-react"
import { useOrderStore } from "@/entities/orders/model/order-store"
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/entities/orders/lib/constants"
import { formatCurrency, formatDate } from "@/shared/lib/utils"

export function OrderTable() {
  const router = useRouter()
  const {
    orders,
    pagination,
    filters,
    isLoading,
    error,
    fetchOrders,
    setFilters,
    incrementMount,
    decrementMount,
  } = useOrderStore()

  // Use ref to track if initial fetch has been done
  const hasFetchedRef = useRef(false)
  const lastFiltersRef = useRef<string>("")

  // Mount tracking and initial fetch
  useEffect(() => {
    incrementMount()
    
    // Only fetch on initial mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchOrders(filters)
    }

    return () => {
      decrementMount()
    }
  }, [])

  // Fetch when filters change (but not on initial render)
  useEffect(() => {
    const filtersString = JSON.stringify(filters)
    
    // Skip if this is the first render or filters haven't actually changed
    if (!hasFetchedRef.current || filtersString === lastFiltersRef.current) {
      lastFiltersRef.current = filtersString
      return
    }
    
    lastFiltersRef.current = filtersString
    fetchOrders(filters, true)
  }, [filters])

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  const handleViewDetail = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`)
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Shipping</TableHead>
              <TableHead className="text-right">Final Amount</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground h-32">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {order.userName || order.guestName || "Guest"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.userEmail || order.guestEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.itemCount} items</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.subtotalOriginal)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{formatCurrency(order.productDiscountAmount + order.couponDiscountAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.shippingFeeActual)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(order.finalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={ORDER_STATUS_COLORS[order.orderStatus]}>
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
            {pagination.totalItems} orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

