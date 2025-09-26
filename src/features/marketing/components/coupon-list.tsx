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
// Mock interface
interface CouponListItem {
  id: string
  name: string
  code?: string
  description?: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number
  validFrom: Date
  validTo: Date
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  usedCount: number
  isActive: boolean
  status?: string | number
}
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, Percent, Calendar } from "lucide-react"

// Mock data - replace with actual API call
const mockCoupons: any[] = [
  {
    id: "1",
    code: "ANIME2024",
    description: "20% off all anime figures",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    usageLimit: 1000,
    usedCount: 245,
    startDate: new Date("2024-01-01T00:00:00Z"),
    endDate: new Date("2024-12-31T23:59:59Z"),
    isActive: true,
    status: 1,
  },
  {
    id: "2",
    code: "WELCOME10",
    description: "Welcome discount for new customers",
    discountType: "fixed",
    discountValue: 10,
    minOrderAmount: 25,
    maxDiscountAmount: 10,
    usageLimit: 500,
    usedCount: 89,
    startDate: new Date("2024-01-01T00:00:00Z"),
    endDate: new Date("2024-06-30T23:59:59Z"),
    isActive: true,
    status: 1,
  },
  {
    id: "3",
    code: "EXPIRED50",
    description: "Expired summer sale coupon",
    discountType: "percentage",
    discountValue: 50,
    minOrderAmount: 100,
    maxDiscountAmount: 200,
    usageLimit: 200,
    usedCount: 200,
    startDate: new Date("2023-06-01T00:00:00Z"),
    endDate: new Date("2023-08-31T23:59:59Z"),
    isActive: false,
    status: 0,
  },
]

const statusOptions = [
  { value: "all", label: "All Coupons" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
]

export function CouponList() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<CouponListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filteredCoupons, setFilteredCoupons] = useState<CouponListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCoupons(mockCoupons)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = coupons.filter(
      (coupon) =>
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedStatus !== "all") {
      if (selectedStatus === "expired") {
        filtered = filtered.filter((coupon) => coupon.endDate && new Date(coupon.endDate) < new Date())
      } else {
        const isActive = selectedStatus === "active"
        filtered = filtered.filter((coupon) => coupon.isActive === isActive)
      }
    }

    setFilteredCoupons(filtered)
  }, [coupons, searchTerm, selectedStatus])

  const getStatusBadge = (coupon: any) => {
    const now = new Date()
    const endDate = coupon.endDate ? new Date(coupon.endDate) : null

    if (endDate && endDate < now) {
      return <Badge variant="error">Expired</Badge>
    } else if (!coupon.isActive) {
      return <Badge variant="neutral">Inactive</Badge>
    } else if (coupon.usedCount >= coupon.usageLimit) {
      return <Badge variant="warning">Used Up</Badge>
    } else {
      return <Badge variant="success">Active</Badge>
    }
  }

  const getDiscountDisplay = (coupon: CouponListItem) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`
    } else {
      return `$${coupon.discountValue}`
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
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
          <Button onClick={() => router.push(ROUTES.COUPON_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
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
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="font-mono font-medium">{coupon.code}</div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs line-clamp-2">{coupon.description}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Percent className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{getDiscountDisplay(coupon)}</span>
                  </div>
                  {coupon.minOrderAmount > 0 && (
                    <div className="text-xs text-muted-foreground">Min: ${coupon.minOrderAmount}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {coupon.usedCount} / {coupon.usageLimit}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${coupon.usageLimit ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{coupon.startDate ? formatDate(coupon.startDate) : 'N/A'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">to {coupon.endDate ? formatDate(coupon.endDate) : 'N/A'}</div>
                </TableCell>
                <TableCell>{getStatusBadge(coupon)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.COUPON_DETAIL(coupon.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.COUPON_DETAIL(coupon.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
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

        {filteredCoupons.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No coupons found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
