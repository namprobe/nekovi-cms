"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react"
import { ROUTES, STATUS_VARIANTS } from "@/core/config"
import { shippingMethodService } from "@/entities/shipping-methods/services/shipping-method.service"
import type { ShippingMethodResponse } from "@/entities/shipping-methods/types/shipping-method"
import { useToast } from "@/hooks/use-toast"

export default function ShippingMethodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [shippingMethod, setShippingMethod] = useState<ShippingMethodResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await shippingMethodService.getShippingMethodById(id)
        if (result.isSuccess && result.data) {
          setShippingMethod(result.data)
        } else {
          toast({ title: "Error", description: "Shipping method not found", variant: "destructive" })
          router.push(ROUTES.SHIPPING_METHODS)
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load shipping method", variant: "destructive" })
        router.push(ROUTES.SHIPPING_METHODS)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shipping method? This cannot be undone if it's in use.")) return
    try {
      const result = await shippingMethodService.deleteShippingMethod(id)
      if (result.isSuccess) {
        toast({ title: "Success", description: "Shipping method deleted successfully" })
        router.push(ROUTES.SHIPPING_METHODS)
      } else {
        toast({ title: "Error", description: result.message || "Failed to delete", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete shipping method", variant: "destructive" })
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

  if (!shippingMethod) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.SHIPPING_METHODS)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{shippingMethod.name}</h1>
            <p className="text-muted-foreground">Shipping method details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(ROUTES.SHIPPING_METHOD_EDIT(id))}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Method Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold mt-1">{shippingMethod.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(shippingMethod.status)}</div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="mt-1">{shippingMethod.description || "-"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shipping Cost</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(shippingMethod.cost)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
              <p className="text-2xl font-bold mt-1">
                {shippingMethod.estimatedDays ? `${shippingMethod.estimatedDays} days` : "Not specified"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                {new Date(shippingMethod.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{" "}
                {new Date(shippingMethod.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
