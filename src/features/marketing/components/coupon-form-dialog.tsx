// src/features/coupons/components/coupon-form-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { Coupon } from "@/entities/coupon/types/coupon"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CouponFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingCoupon?: Coupon | null
    onSave: (formData: FormData, isEdit: boolean, id?: string) => Promise<void>
}

export function CouponFormDialog({ open, onOpenChange, editingCoupon, onSave }: CouponFormDialogProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState({ 
        code: "", 
        description: "", 
        discountType: "0", // 0: Percentage, 1: FixedAmount, 2: FreeShipping
        discountValue: "",
        maxDiscountCap: "",
        minOrderAmount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        status: "1" // 1: active, 0: inactive
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const isFreeShipping = formData.discountType === "2"

    // Reset form when dialog opens/closes or editing coupon changes
    useEffect(() => {
        if (editingCoupon) {
            setFormData({
                code: editingCoupon.code,
                description: editingCoupon.description || "",
                discountType: editingCoupon.discountType.toString(),
                discountValue:
                    editingCoupon.discountType === 2
                        ? "0"
                        : editingCoupon.discountValue.toString(),
                maxDiscountCap: editingCoupon.maxDiscountCap?.toString() || "",
                minOrderAmount: editingCoupon.minOrderAmount.toString(),
                startDate: editingCoupon.startDate.split('T')[0], // Convert to YYYY-MM-DD
                endDate: editingCoupon.endDate.split('T')[0],
                usageLimit: editingCoupon.usageLimit?.toString() || "",
                status: editingCoupon.status.toString(),
            })
        } else {
            // Set default values for new coupon
            const today = new Date().toISOString().split('T')[0]
            const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            
            setFormData({ 
                code: "", 
                description: "", 
                discountType: "0",
                discountValue: "",
                maxDiscountCap: "",
                minOrderAmount: "",
                startDate: today,
                endDate: oneMonthLater,
                usageLimit: "",
                status: "1"
            })
        }
        setErrors({})
    }, [editingCoupon, open])

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        if (field === "discountType" && editingCoupon) {
            // Prevent changing discount type while editing existing coupon
            return
        }
        setFormData((prev) => {
            if (field === "discountType") {
                const nextState = { ...prev, discountType: value }
                if (value === "2") {
                    nextState.discountValue = "0"
                } else if (prev.discountType === "2" && value !== "2") {
                    nextState.discountValue = ""
                }
                return nextState
            }
            return { ...prev, [field]: value }
        })
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
        if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Code validation
        if (!formData.code.trim()) {
            newErrors.code = "Coupon code is required"
        } else if (formData.code.length < 3 || formData.code.length > 50) {
            newErrors.code = "Coupon code must be between 3 and 50 characters"
        }

        // Discount value validation
        if (!isFreeShipping) {
            if (!formData.discountValue.trim()) {
                newErrors.discountValue = "Discount value is required"
            } else {
                const discountValue = parseFloat(formData.discountValue)
                if (isNaN(discountValue) || discountValue <= 0) {
                    newErrors.discountValue = "Discount value must be a positive number"
                } else if (formData.discountType === "0" && discountValue > 100) {
                    newErrors.discountValue = "Percentage discount cannot exceed 100%"
                }
            }
        }

        // Max discount cap validation (only for Percentage type)
        if (formData.discountType === "0" && formData.maxDiscountCap.trim()) {
            const maxDiscountCap = parseFloat(formData.maxDiscountCap)
            if (isNaN(maxDiscountCap) || maxDiscountCap <= 0) {
                newErrors.maxDiscountCap = "Max discount cap must be a positive number"
            }
        }

        // Min order amount validation
        if (!formData.minOrderAmount.trim()) {
            newErrors.minOrderAmount = "Minimum order amount is required"
        } else {
            const minOrderAmount = parseFloat(formData.minOrderAmount)
            if (isNaN(minOrderAmount) || minOrderAmount < 0) {
                newErrors.minOrderAmount = "Minimum order amount must be a non-negative number"
            }
        }

        // Date validation
        if (!formData.startDate) {
            newErrors.startDate = "Start date is required"
        }
        if (!formData.endDate) {
            newErrors.endDate = "End date is required"
        }
        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate)
            const endDate = new Date(formData.endDate)
            if (endDate <= startDate) {
                newErrors.endDate = "End date must be after start date"
            }
            // if (endDate < new Date()) {
            //     newErrors.endDate = "End date cannot be in the past"
            // }
        }

        // Usage limit validation
        if (formData.usageLimit.trim()) {
            const usageLimit = parseInt(formData.usageLimit)
            if (isNaN(usageLimit) || usageLimit < 1) {
                newErrors.usageLimit = "Usage limit must be a positive number"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        handleInputChange('code', result)
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const data = new FormData()
        data.append("Code", formData.code.toUpperCase())
        data.append("Description", formData.description || "")
        data.append("DiscountType", formData.discountType)
        data.append("DiscountValue", isFreeShipping ? "0" : formData.discountValue)
        data.append("MaxDiscountCap", formData.discountType === "0" && formData.maxDiscountCap.trim() ? formData.maxDiscountCap : "")
        data.append("MinOrderAmount", formData.minOrderAmount)
        data.append("StartDate", formData.startDate + "T00:00:00.000Z") // Convert to ISO string
        data.append("EndDate", formData.endDate + "T23:59:59.999Z")
        data.append("UsageLimit", formData.usageLimit || "0")
        data.append("Status", formData.status)

        setIsLoading(true)
        try {
            await onSave(data, !!editingCoupon, editingCoupon?.id)
            // Success handling is done in handleSave
        } catch (err: any) {
            const errorMessage = err.message || "Failed to save coupon"
            setErrors({ general: errorMessage })
            toast({ 
                title: editingCoupon ? "Update Failed" : "Create Failed", 
                description: errorMessage, 
                variant: "destructive" 
            })
            // Keep dialog open so user can see and fix the errors
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
                    <DialogDescription>
                        {editingCoupon
                            ? "Update coupon details and validity period."
                            : "Create a new discount coupon with code, value, and usage limits."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

                    {/* Coupon Code */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="code">Coupon Code *</Label>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={generateRandomCode}
                                disabled={isLoading}
                            >
                                Generate Code
                            </Button>
                        </div>
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                            placeholder="e.g., SUMMER25"
                            disabled={isLoading}
                            className="font-mono"
                        />
                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Optional description for this coupon"
                            disabled={isLoading}
                            rows={3}
                        />
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discountType">Discount Type *</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(value) => handleInputChange("discountType", value)}
                                disabled={isLoading || !!editingCoupon}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="0">Percentage (%)</SelectItem>
                                <SelectItem value="1">Fixed Amount</SelectItem>
                                <SelectItem value="2">Free Shipping</SelectItem>
                                </SelectContent>
                            </Select>
                            {editingCoupon && (
                                <p className="text-xs text-muted-foreground">
                                    Discount type cannot be changed after creation
                                </p>
                            )}
                        </div>

                        {!isFreeShipping ? (
                            <div className="space-y-2">
                                <Label htmlFor="discountValue">
                                    Discount Value *
                                    {formData.discountType === "0" ? " (%)" : " (currency)"}
                                </Label>
                                <Input
                                    id="discountValue"
                                    type="number"
                                    step={formData.discountType === "0" ? "0.01" : "1"}
                                    min="0"
                                    max={formData.discountType === "0" ? "100" : undefined}
                                    value={formData.discountValue}
                                    onChange={(e) => handleInputChange("discountValue", e.target.value)}
                                    placeholder={
                                        formData.discountType === "0" ? "e.g., 25" : "e.g., 100000"
                                    }
                                    disabled={isLoading}
                                />
                                {errors.discountValue && (
                                    <p className="text-sm text-red-600">{errors.discountValue}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Discount Value</Label>
                                <div className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                                    Free shipping vouchers do not require a discount value.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Max Discount Cap - Only for Percentage type */}
                    {formData.discountType === "0" && (
                        <div className="space-y-2">
                            <Label htmlFor="maxDiscountCap">Max Discount Cap (Optional)</Label>
                            <Input
                                id="maxDiscountCap"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.maxDiscountCap}
                                onChange={(e) => handleInputChange("maxDiscountCap", e.target.value)}
                                placeholder="e.g., 50000"
                                disabled={isLoading}
                            />
                            {errors.maxDiscountCap && (
                                <p className="text-sm text-red-600">{errors.maxDiscountCap}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Maximum discount amount for percentage coupons. Leave empty for no limit.
                                Example: 13% discount with max cap of 80,000đ means maximum discount is 80,000đ.
                            </p>
                        </div>
                    )}

                    {/* Minimum Order Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="minOrderAmount">Minimum Order Amount ($) *</Label>
                        <Input
                            id="minOrderAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.minOrderAmount}
                            onChange={(e) => handleInputChange("minOrderAmount", e.target.value)}
                            placeholder="e.g., 50.00"
                            disabled={isLoading}
                        />
                        {errors.minOrderAmount && <p className="text-sm text-red-600">{errors.minOrderAmount}</p>}
                    </div>

                    {/* Validity Period */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange("endDate", e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                        <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                        <Input
                            id="usageLimit"
                            type="number"
                            min="1"
                            value={formData.usageLimit}
                            onChange={(e) => handleInputChange("usageLimit", e.target.value)}
                            placeholder="Leave empty for unlimited usage"
                            disabled={isLoading}
                        />
                        {errors.usageLimit && <p className="text-sm text-red-600">{errors.usageLimit}</p>}
                        <p className="text-sm text-muted-foreground">
                            Maximum number of times this coupon can be used. Leave empty for unlimited usage.
                        </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleInputChange("status", value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex justify-end space-x-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onOpenChange(false)} 
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Saving...
                            </>
                        ) : (
                            editingCoupon ? "Update Coupon" : "Create Coupon"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}