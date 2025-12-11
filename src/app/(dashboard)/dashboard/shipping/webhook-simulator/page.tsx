"use client"

import { useMemo, useState } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { env } from "@/core/config/env"
import { shippingWebhookService } from "@/entities/shipping/services/shipping-webhook"
import type { GHNCallbackPayload } from "@/entities/shipping/types/ghn-callback"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Separator } from "@/shared/ui/separator"
import { Textarea } from "@/shared/ui/textarea"

const statusOptions = [
    { value: "ready_to_pick", label: "ready_to_pick - Chờ lấy hàng" },
    { value: "picking", label: "picking - Đang lấy hàng" },
    { value: "picked", label: "picked - Đã lấy hàng" },
    { value: "storing", label: "storing - Đang lưu kho" },
    { value: "transporting", label: "transporting - Đang vận chuyển" },
    { value: "delivering", label: "delivering - Đang giao hàng" },
    { value: "delivered", label: "delivered - Đã giao hàng" },
    { value: "delivery_fail", label: "delivery_fail - Giao hàng thất bại" },
    { value: "returning", label: "returning - Đang trả hàng" },
    { value: "returned", label: "returned - Đã trả hàng" },
    { value: "cancel", label: "cancel - Đã hủy" },
    { value: "exception", label: "exception - Ngoại lệ" },
]

const typeOptions = [
    { value: "create", label: "create (Tạo đơn)" },
    { value: "switch_status", label: "switch_status (Đổi trạng thái)" },
    { value: "update_weight", label: "update_weight" },
    { value: "update_cod", label: "update_cod" },
    { value: "update_fee", label: "update_fee" },
]

const basePayload: GHNCallbackPayload = {
    CODAmount: 0,
    CODTransferDate: null,
    ClientOrderCode: "",
    ConvertedWeight: 200,
    Description: "Tạo đơn hàng",
    Fee: {
        CODFailedFee: 0,
        CODFee: 0,
        Coupon: 0,
        DeliverRemoteAreasFee: 0,
        DocumentReturn: 0,
        DoubleCheck: 0,
        Insurance: 17500,
        MainService: 53900,
        PickRemoteAreasFee: 53900,
        R2S: 0,
        Return: 0,
        StationDO: 0,
        StationPU: 0,
        Total: 0,
    },
    Height: 10,
    IsPartialReturn: false,
    Length: 10,
    OrderCode: "Z82BS",
    PartialReturnCode: "",
    PaymentType: 1,
    Reason: "",
    ReasonCode: "",
    ShopID: Number(env.SHOP_ID) || 81558,
    Status: "ready_to_pick",
    Time: "2021-11-11T03:52:50.158Z",
    TotalFee: 71400,
    Type: "create",
    Warehouse: "Bưu Cục 229 Quan Nhân-Q.Thanh Xuân-HN",
    Weight: 10,
    Width: 10,
}

export default function GHNWebhookSimulatorPage() {
    const { toast } = useToast()
    const [orderCode, setOrderCode] = useState(basePayload.OrderCode)
    const [clientOrderCode, setClientOrderCode] = useState(basePayload.ClientOrderCode ?? "")
    const [type, setType] = useState(typeOptions[0].value)
    const [status, setStatus] = useState(statusOptions[0].value)
    const [codAmount, setCodAmount] = useState<number | undefined>(basePayload.CODAmount ?? undefined)
    const [totalFee, setTotalFee] = useState<number | undefined>(basePayload.TotalFee ?? undefined)
    const [weight, setWeight] = useState<number | undefined>(basePayload.Weight ?? undefined)
    const [convertedWeight, setConvertedWeight] = useState<number | undefined>(basePayload.ConvertedWeight ?? undefined)
    const [paymentType, setPaymentType] = useState<number | undefined>(basePayload.PaymentType ?? undefined)
    const [reason, setReason] = useState(basePayload.Reason ?? "")
    const [reasonCode, setReasonCode] = useState(basePayload.ReasonCode ?? "")
    const [warehouse, setWarehouse] = useState(basePayload.Warehouse ?? "")
    const [shopId, setShopId] = useState<number | undefined>(basePayload.ShopID ?? undefined)
    const [isPartialReturn, setIsPartialReturn] = useState<boolean>(basePayload.IsPartialReturn ?? false)
    const [responseText, setResponseText] = useState("")
    const [isSending, setIsSending] = useState(false)

    const livePayload = useMemo<GHNCallbackPayload>(() => {
        return {
            ...basePayload,
            OrderCode: orderCode || basePayload.OrderCode,
            ClientOrderCode: clientOrderCode || "",
            Type: type,
            Status: status,
            CODAmount: codAmount ?? basePayload.CODAmount,
            TotalFee: totalFee ?? basePayload.TotalFee,
            Weight: weight ?? basePayload.Weight,
            ConvertedWeight: convertedWeight ?? basePayload.ConvertedWeight,
            PaymentType: paymentType ?? basePayload.PaymentType,
            Reason: reason || basePayload.Reason,
            ReasonCode: reasonCode || basePayload.ReasonCode,
            Warehouse: warehouse || basePayload.Warehouse,
            ShopID: shopId ?? basePayload.ShopID,
            IsPartialReturn: isPartialReturn,
            Time: new Date().toISOString(),
        }
    }, [
        orderCode,
        clientOrderCode,
        type,
        status,
        codAmount,
        totalFee,
        weight,
        convertedWeight,
        paymentType,
        reason,
        reasonCode,
        warehouse,
        shopId,
        isPartialReturn,
    ])

    const handleSend = async () => {
        setIsSending(true)
        setResponseText("")
        const result = await shippingWebhookService.simulateGHNCallback(livePayload)
        setIsSending(false)

        if (result.isSuccess) {
            toast({
                title: "Đã gửi webhook giả lập",
                description: result.message || "Callback được backend xử lý thành công (HTTP 200).",
            })
            setResponseText(JSON.stringify(result.data ?? result, null, 2))
        } else {
            toast({
                title: "Gửi thất bại",
                description: result.message || "Không thể gửi callback. Kiểm tra logs/URL.",
                variant: "destructive",
            })
            setResponseText(JSON.stringify(result, null, 2))
        }
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">GHN Webhook Simulator</h1>
                <p className="text-muted-foreground">
                    Gửi payload giả lập từ GHN để cập nhật trạng thái đơn hàng. API đích:{" "}
                    <code className="rounded bg-muted px-2 py-0.5 text-sm">/api/shipping-order/ghn/simulate-callback</code>
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin bắt buộc</CardTitle>
                    <CardDescription>Nhập các trường backend cần để cập nhật trạng thái đơn hàng.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="orderCode">OrderCode *</Label>
                            <Input
                                id="orderCode"
                                value={orderCode}
                                onChange={(e) => setOrderCode(e.target.value)}
                                placeholder="Mã vận đơn (bắt buộc)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientOrderCode">ClientOrderCode</Label>
                            <Input
                                id="clientOrderCode"
                                value={clientOrderCode}
                                onChange={(e) => setClientOrderCode(e.target.value)}
                                placeholder="Mã đơn nội bộ (nếu có)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <select
                                id="type"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                {typeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <select
                                id="status"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codAmount">CODAmount</Label>
                            <Input
                                id="codAmount"
                                type="number"
                                value={codAmount ?? ""}
                                onChange={(e) => setCodAmount(e.target.value === "" ? undefined : Number(e.target.value))}
                                placeholder="Tiền thu hộ"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalFee">TotalFee</Label>
                            <Input
                                id="totalFee"
                                type="number"
                                value={totalFee ?? ""}
                                onChange={(e) => setTotalFee(e.target.value === "" ? undefined : Number(e.target.value))}
                                placeholder="Tổng phí dịch vụ"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (g)</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={weight ?? ""}
                                onChange={(e) => setWeight(e.target.value === "" ? undefined : Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="convertedWeight">ConvertedWeight (g)</Label>
                            <Input
                                id="convertedWeight"
                                type="number"
                                value={convertedWeight ?? ""}
                                onChange={(e) =>
                                    setConvertedWeight(e.target.value === "" ? undefined : Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentType">PaymentType</Label>
                            <Input
                                id="paymentType"
                                type="number"
                                value={paymentType ?? ""}
                                onChange={(e) => setPaymentType(e.target.value === "" ? undefined : Number(e.target.value))}
                                placeholder="1: Người gửi, 2: Người nhận..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shopId">ShopID</Label>
                            <Input
                                id="shopId"
                                type="number"
                                value={shopId ?? ""}
                                onChange={(e) => setShopId(e.target.value === "" ? undefined : Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="warehouse">Warehouse</Label>
                            <Input
                                id="warehouse"
                                value={warehouse}
                                onChange={(e) => setWarehouse(e.target.value)}
                                placeholder="Bưu cục / kho"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="isPartialReturn">IsPartialReturn</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="isPartialReturn"
                                    type="checkbox"
                                    checked={isPartialReturn}
                                    onChange={(e) => setIsPartialReturn(e.target.checked)}
                                />
                                <span className="text-sm text-muted-foreground">Đơn giao một phần</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Lý do (nếu có)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reasonCode">ReasonCode</Label>
                            <Input
                                id="reasonCode"
                                value={reasonCode}
                                onChange={(e) => setReasonCode(e.target.value)}
                                placeholder="Mã lý do (nếu có)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={handleSend} disabled={isSending}>
                            {isSending ? "Đang gửi..." : "Gửi webhook giả lập"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Payload sẽ gửi</CardTitle>
                        <CardDescription>Tự động sinh từ form ở trên (không cần sửa JSON).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={JSON.stringify(livePayload, null, 2)}
                            readOnly
                            className="font-mono h-[520px] bg-muted/40"
                        />
                        <Separator className="my-4" />
                        <div className="text-sm text-muted-foreground">
                            <div>Type hỗ trợ: create, switch_status, update_weight, update_cod, update_fee.</div>
                            <div>GHN sẽ retry 10 lần nếu không trả về HTTP 200.</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Phản hồi từ API</CardTitle>
                        <CardDescription>Hiển thị JSON response (backend trả về code 200).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="font-mono h-[520px]"
                            placeholder="Response sẽ hiển thị ở đây sau khi gửi..."
                        />
                        <Separator className="my-4" />
                        <div className="text-sm text-muted-foreground">
                            <div>OrderCode: <span className="font-medium text-foreground">{livePayload.OrderCode}</span></div>
                            <div>Type: <span className="font-medium text-foreground">{livePayload.Type}</span></div>
                            <div>Status: <span className="font-medium text-foreground">{livePayload.Status}</span></div>
                            <div>Time: <span className="font-medium text-foreground">{livePayload.Time}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

