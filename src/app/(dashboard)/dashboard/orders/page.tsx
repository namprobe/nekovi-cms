"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { OrderFilters } from "@/features/orders/components/order-filters"
import { OrderTable } from "@/features/orders/components/order-table"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer orders and track shipments
        </p>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable />
        </CardContent>
      </Card>
    </div>
  )
}
