"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { OrderListItem } from "@/entities/orders/types/order"
import { OrderStatus, PaymentStatus } from "@/shared/types/common"
import { ORDER_STATUS_VARIANTS, PAYMENT_STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, MoreHorizontal, Eye, Edit, Package, Filter } from "lucide-react"

// Mock data - replace with actual API call
const mockOrders: OrderListItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    totalAmount: 89.97,
    finalAmount: 79.97,
    orderStatus: OrderStatus.Processing,
    paymentStatus: PaymentStatus.Completed,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    itemCount: 3,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    totalAmount: 149.99,
    finalAmount: 149.99,
    orderStatus: OrderStatus.Shipped,
    paymentStatus: PaymentStatus.Completed,
    createdAt: new Date("2024-01-14T15:45:00Z"),
    itemCount: 2,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    totalAmount: 29.99,
    finalAmount: 29.99,
    orderStatus: OrderStatus.Pending,
    paymentStatus: PaymentStatus.Pending,
    createdAt: new Date("2024-01-13T09:15:00Z"),
    itemCount: 1,
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customerName: "Alice Brown",
    customerEmail: "alice.brown@example.com",
    totalAmount: 199.98,
    finalAmount: 179.98,
    orderStatus: OrderStatus.Delivered,
    paymentStatus: PaymentStatus.Completed,
    createdAt: new Date("2024-01-12T14:20:00Z"),
    itemCount: 4,
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customerName: "Charlie Wilson",
    customerEmail: "charlie.wilson@example.com",
    totalAmount: 59.99,
    finalAmount: 59.99,
    orderStatus: OrderStatus.Cancelled,
    paymentStatus: PaymentStatus.Refunded,
    createdAt: new Date("2024-01-11T11:30:00Z"),
    itemCount: 2,
  },
]

const orderStatusOptions = [
  { value: "all", label: "All Status" },
  { value: OrderStatus.Pending.toString(), label: "Pending" },
  { value: OrderStatus.Processing.toString(), label: "Processing" },
  { value: OrderStatus.Shipped.toString(), label: "Shipped" },
  { value: OrderStatus.Delivered.toString(), label: "Delivered" },
  { value: OrderStatus.Cancelled.toString(), label: "Cancelled" },
]

const paymentStatusOptions = [
  { value: "all", label: "All Payments" },
  { value: PaymentStatus.Pending.toString(), label: "Pending" },
  { value: PaymentStatus.Completed.toString(), label: "Completed" },
  { value: PaymentStatus.Failed.toString(), label: "Failed" },
  { value: PaymentStatus.Refunded.toString(), label: "Refunded" },
]

export function OrderList() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")
  const [filteredOrders, setFilteredOrders] = useState<OrderListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedOrderStatus !== "all") {
      filtered = filtered.filter((order) => order.orderStatus.toString() === selectedOrderStatus)
    }

    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus.toString() === selectedPaymentStatus)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, selectedOrderStatus, selectedPaymentStatus])

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
      <Badge variant={ORDER_STATUS_VARIANTS[status as keyof typeof ORDER_STATUS_VARIANTS]}>{statusLabels[status]}</Badge>
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
      <Badge variant={PAYMENT_STATUS_VARIANTS[status as keyof typeof PAYMENT_STATUS_VARIANTS]}>
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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    // TODO: Implement API call to update order status
    console.log("Updating order status:", orderId, newStatus)

    // Update local state for demo
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, orderStatus: newStatus } : order)))
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
          <CardTitle>Orders</CardTitle>
          <div className="flex items-center space-x-2">
             <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {filteredOrders.length} orders
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedOrderStatus} onValueChange={setSelectedOrderStatus}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.orderNumber}</div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{order.itemCount} items</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatPrice(order.finalAmount)}</span>
                    {order.totalAmount !== order.finalAmount && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(order.totalAmount)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.orderStatus)}</TableCell>
                <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.ORDER_DETAIL(order.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.ORDER_DETAIL(order.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      {order.orderStatus === OrderStatus.Processing && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, OrderStatus.Shipped)}>
                          <Package className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </DropdownMenuItem>
                      )}
                      {order.orderStatus === OrderStatus.Shipped && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, OrderStatus.Delivered)}>
                          <Package className="mr-2 h-4 w-4" />
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
