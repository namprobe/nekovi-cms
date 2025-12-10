"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select"
import { Card, CardContent } from "@/shared/ui/card"
import { Filter, X, User } from "lucide-react"
import { useOrderStore } from "@/entities/orders/model/order-store"
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/entities/orders/lib/constants"
import type { OrderFilterParams } from "@/entities/orders/types/order"
import { CustomerSelectorModal } from "./customer-selector-modal"
import { useDebounce } from "@/hooks/use-debounce"

export function OrderFilters() {
  const { filters, setFilters, resetFilters } = useOrderStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<Partial<OrderFilterParams>>(filters)
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  
  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch })
    }
  }, [debouncedSearch])

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setIsExpanded(false)
  }

  const handleReset = () => {
    setTempFilters({})
    resetFilters()
    setIsExpanded(false)
  }

  const handleCustomerSelect = (userId: string, userEmail: string, userName: string) => {
    setTempFilters((prev) => ({
      ...prev,
      userId: userId || undefined,
      userEmail: userEmail || undefined,
    }))
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => 
      key !== "page" && 
      key !== "pageSize" && 
      key !== "sortBy" && 
      key !== "isAscending" && 
      key !== "status" &&
      filters[key as keyof OrderFilterParams] !== undefined &&
      filters[key as keyof OrderFilterParams] !== ""
  ).length

  return (
    <div className="space-y-4">
      {/* Quick filters bar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            className="w-full"
          />
        </div>

        {/* Order Status */}
        <Select
          value={tempFilters.orderStatus?.toString() || "all"}
          onValueChange={(value) => {
            const newValue = value === "all" ? undefined : Number(value)
            setTempFilters((prev) => ({ ...prev, orderStatus: newValue }))
            setFilters({ orderStatus: newValue })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Status */}
        <Select
          value={tempFilters.paymentStatus?.toString() || "all"}
          onValueChange={(value) => {
            const newValue = value === "all" ? undefined : Number(value)
            setTempFilters((prev) => ({ ...prev, paymentStatus: newValue }))
            setFilters({ paymentStatus: newValue })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          More Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer Filter */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email or name"
                    value={tempFilters.userEmail || ""}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCustomerModalOpen(true)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={tempFilters.dateFrom || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={tempFilters.dateTo || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                />
              </div>

              {/* Min Amount */}
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={tempFilters.minAmount || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      minAmount: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>

              {/* Max Amount */}
              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={tempFilters.maxAmount || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      maxAmount: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>

              {/* Has Coupon */}
              <div className="space-y-2">
                <Label>Coupon Usage</Label>
                <Select
                  value={
                    tempFilters.hasCoupon === undefined
                      ? "any"
                      : tempFilters.hasCoupon
                      ? "true"
                      : "false"
                  }
                  onValueChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      hasCoupon: value === "any" ? undefined : value === "true",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">With Coupon</SelectItem>
                    <SelectItem value="false">Without Coupon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Selector Modal */}
      <CustomerSelectorModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={handleCustomerSelect}
        selectedUserId={tempFilters.userId}
      />
    </div>
  )
}

