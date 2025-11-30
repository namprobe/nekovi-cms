// src/features/coupons/components/coupon-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Copy } from "lucide-react"
import { couponService } from "@/entities/coupon/services/coupon"
import type { Coupon } from "@/entities/coupon/types/coupon"
import { CouponFormDialog } from "./coupon-form-dialog"
import { useToast } from "@/hooks/use-toast"

export function CouponList() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // 🧩 Pagination states
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await couponService.getCoupons({
        page,
        limit,
        search: searchTerm,
      })

      // ✅ Ensure response has { items, total } structure
      setCoupons(response.items || [])
      setTotal(response.totalItems || 0)
    } catch (error: any) {
      console.error("Failed to load coupons:", error)
      toast({ 
        title: "Error", 
        description: error.message || "Failed to load coupons", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  // Call API when page, limit, or searchTerm changes
  useEffect(() => {
    fetchCoupons()
  }, [page, limit, searchTerm])

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      1: { text: "Active", variant: "success" as const },
      0: { text: "Inactive", variant: "outline" as const },
      2: { text: "Expired", variant: "destructive" as const }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { text: "Unknown", variant: "outline" as const }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getDiscountTypeText = (discountType: number) => {
    switch (discountType) {
      case 0:
        return "Percentage"
      case 1:
        return "Fixed Amount"
      case 2:
        return "Free Shipping"
      default:
        return "Unknown"
    }
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 0) {
      // Percentage
      const discountText = `${coupon.discountValue}%`
      if (coupon.maxDiscountCap && coupon.maxDiscountCap > 0) {
        return `${discountText} (max $${coupon.maxDiscountCap.toFixed(2)})`
      }
      return discountText
    } else if (coupon.discountType === 1) {
      // Fixed Amount
      return `$${coupon.discountValue.toFixed(2)}`
    } else {
      // Free Shipping
      return "Free Shipping"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isCouponExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      await couponService.deleteCoupon(couponId)
      toast({ title: "Success", description: "Coupon deleted successfully" })
      await fetchCoupons()
    } catch (error: any) {
      console.error(error)
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete coupon", 
        variant: "destructive" 
      })
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard",
    })
  }

  // Trong coupon-list.tsx - SỬA handleSave function
const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
  // ✅ CONVERT FormData to JSON with PascalCase for C# backend
  const jsonData = {
    Code: formData.get("Code") as string,
    Description: formData.get("Description") as string || undefined,
    DiscountType: parseInt(formData.get("DiscountType") as string),
    DiscountValue: parseFloat(formData.get("DiscountValue") as string),
    MaxDiscountCap: formData.get("MaxDiscountCap") && (formData.get("MaxDiscountCap") as string).trim() 
      ? parseFloat(formData.get("MaxDiscountCap") as string) 
      : undefined,
    MinOrderAmount: parseFloat(formData.get("MinOrderAmount") as string),
    StartDate: formData.get("StartDate") as string,
    EndDate: formData.get("EndDate") as string,
    UsageLimit: formData.get("UsageLimit") ? parseInt(formData.get("UsageLimit") as string) : undefined,
    Status: parseInt(formData.get("Status") as string),
  }

  console.log("📤 Sending JSON data with PascalCase:", jsonData) // Debug

  let result
  if (isEdit && id) {
    result = await couponService.updateCoupon(id, jsonData)
  } else {
    result = await couponService.createCoupon(jsonData)
  }

  // ✅ Check if the API call was successful
  if (!result.isSuccess) {
    console.log("❌ API Error Response:", result) // Debug: see full error structure
    
    // Extract validation errors from backend response
    let errorMessage = "Failed to save coupon"
    
    // Sometimes the backend wraps the error as a JSON string in the message field
    if (result.message && typeof result.message === 'string' && result.message.includes('"errors"')) {
      try {
        const parsed = JSON.parse(result.message)
        if (parsed.errors && typeof parsed.errors === 'object') {
          const errorFields = Object.keys(parsed.errors)
          if (errorFields.length > 0) {
            const messages = parsed.errors[errorFields[0]]
            if (Array.isArray(messages) && messages.length > 0) {
              errorMessage = messages[0]
            }
          }
        }
      } catch (e) {
        // If parsing fails, try the normal path
      }
    }
    
    // Check for C# validation errors format: { errors: { field: [messages] } }
    if (errorMessage === "Failed to save coupon" && result.errors && typeof result.errors === 'object' && !Array.isArray(result.errors)) {
      const errorFields = Object.keys(result.errors)
      if (errorFields.length > 0) {
        const messages = (result.errors as Record<string, unknown>)[errorFields[0]]
        if (Array.isArray(messages) && messages.length > 0) {
          errorMessage = String(messages[0])
        }
      }
    }
    
    // Fallback to result.message if we still haven't found anything
    if (errorMessage === "Failed to save coupon" && result.message && typeof result.message === 'string' && !result.message.includes('{')) {
      errorMessage = result.message
    }
    
    console.log("📢 Extracted error message:", errorMessage) // Debug
    
    // Throw error to be caught by dialog component
    throw new Error(errorMessage)
  }

  // Success - show toast and refresh
  toast({ 
    title: "Success", 
    description: isEdit ? "Coupon updated successfully" : "Coupon created successfully" 
  })
  setIsDialogOpen(false)
  await fetchCoupons()
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
          <CardTitle>Coupons</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search coupons by code..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1) // reset page when searching
                setSearchTerm(e.target.value)
              }}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id} className={isCouponExpired(coupon.endDate) ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium bg-blue-50 px-2 py-1 rounded text-sm">
                      {coupon.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyCode(coupon.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <span className="font-medium">{formatDiscount(coupon)}</span>
                    <Badge variant="outline" className="text-xs">
                      {getDiscountTypeText(coupon.discountType)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  ${coupon.minOrderAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">From:</span> {formatDate(coupon.startDate)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">To:</span> {formatDate(coupon.endDate)}
                    </div>
                    {isCouponExpired(coupon.endDate) && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {coupon.currentUsage} / {coupon.usageLimit || '∞'} used
                    </div>
                    {coupon.usageLimit && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.min((coupon.currentUsage / coupon.usageLimit) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(coupon.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDelete(coupon.id)}
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

        {coupons.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No coupons found</p>
          </div>
        )}

        {/* ✅ Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(total / limit) || 1}
          </span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>

      {isDialogOpen && (
        <CouponFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCoupon={editingCoupon}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}