"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react"
import { ROUTES, STATUS_VARIANTS } from "@/core/config"
import { paymentMethodService } from "@/entities/payment-methods/services/payment-method.service"
import type { PaymentMethodResponse } from "@/entities/payment-methods/types/payment-method"
import { useToast } from "@/hooks/use-toast"

export default function PaymentMethodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await paymentMethodService.getPaymentMethodById(id)
        if (result.isSuccess && result.data) {
          setPaymentMethod(result.data)
        } else {
          toast({ title: "Error", description: "Payment method not found", variant: "destructive" })
          router.push(ROUTES.PAYMENT_METHODS)
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load payment method", variant: "destructive" })
        router.push(ROUTES.PAYMENT_METHODS)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment method?")) return
    try {
      const result = await paymentMethodService.deletePaymentMethod(id)
      if (result.isSuccess) {
        toast({ title: "Success", description: "Payment method deleted successfully" })
        router.push(ROUTES.PAYMENT_METHODS)
      } else {
        toast({ title: "Error", description: result.message || "Failed to delete", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete payment method", variant: "destructive" })
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!paymentMethod) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.PAYMENT_METHODS)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{paymentMethod.name}</h1>
            <p className="text-muted-foreground">Payment method details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(ROUTES.PAYMENT_METHOD_EDIT(id))}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethod.iconPath && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Icon</p>
                <img src={paymentMethod.iconPath} alt={paymentMethod.name} className="w-20 h-20 object-cover mt-2 rounded-lg" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{paymentMethod.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{paymentMethod.description || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(paymentMethod.status)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Type</p>
              <Badge variant={paymentMethod.isOnlinePayment ? "default" : "outline"} className="mt-1">
                {paymentMethod.isOnlinePayment ? "Online Payment" : "Offline Payment"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Fee</p>
              <p className="text-lg font-semibold">{formatCurrency(paymentMethod.processingFee)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processor Name</p>
              <p>{paymentMethod.processorName || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Configuration</p>
              <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto">
                {paymentMethod.configuration || "No configuration"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
