// src/features/payment-methods/components/payment-method-list.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Search } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { paymentMethodService } from "@/entities/payment-methods/services/payment-method.service"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

export default function PaymentMethodList() {
  const router = useRouter()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 400)

  const searchParams = useSearchParams()

  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    const urlPage = Number(searchParams.get("page") || 1)
    setSearchTerm(urlSearch)
    setPage(urlPage)
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (page) params.set("page", String(page))
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchTerm, page])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const res = await paymentMethodService.getPaymentMethods({
        page,
        limit,
        search: debouncedSearch || undefined,
      })

      if (res.isSuccess) {
        setPaymentMethods(res.items)
        setTotal(res.totalItems)
      } else {
        setPaymentMethods([])
        setTotal(0)
        const errorMessage = (res as any)?.message ?? "Failed to load payment methods"
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load payment methods", variant: "destructive" })
      setPaymentMethods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [page, debouncedSearch])

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return
    try {
      const result = await paymentMethodService.deletePaymentMethod(id)
      if (result.isSuccess) {
        toast({ title: "Success", description: "Payment method deleted successfully" })
        fetchPaymentMethods()
      } else {
        toast({ 
          title: "Error", 
          description: result.message || "Failed to delete payment method", 
          variant: "destructive" 
        })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete payment method", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  if (loading && paymentMethods.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Methods</CardTitle>
          <Button onClick={() => router.push(ROUTES.PAYMENT_METHOD_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search payment methods..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Processing Fee</TableHead>
              <TableHead>Processor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((method) => (
              <TableRow key={method.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {method.iconPath && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={method.iconPath}
                          alt={method.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="font-medium">{method.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={method.isOnlinePayment ? "default" : "outline"}>
                    {method.isOnlinePayment ? "Online" : "Offline"}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(method.processingFee)}</TableCell>
                <TableCell>{method.processorName || "-"}</TableCell>
                <TableCell>{getStatusBadge(method.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PAYMENT_METHOD_DETAIL(method.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.PAYMENT_METHOD_EDIT(method.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(method.id)}>
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

        {paymentMethods.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No payment methods found for your search." : "No payment methods yet."}
          </div>
        )}

        {total > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <Button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {Math.ceil(total / limit)} ({total} methods)
            </span>
            <Button disabled={page * limit >= total || loading} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
