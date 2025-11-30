// src/features/product-inventory/product-inventory-dialog.tsx
"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { productInventoryService } from "@/entities/product-inventories/services/product-inventory"
import { PackagePlus, Edit3 } from "lucide-react"
import type { ProductInventoryItem } from "@/entities/product-inventories/types/product-inventory"

const formSchema = z.object({
    quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
})

type FormValues = z.infer<typeof formSchema>

interface ProductInventoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    productId: string
    initialData?: ProductInventoryItem | null
    onSuccess: () => void
}

export default function ProductInventoryDialog({
    open,
    onOpenChange,
    productId,
    initialData,
    onSuccess,
}: ProductInventoryDialogProps) {
    const { toast } = useToast()
    const isEdit = !!initialData

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: initialData?.quantity ?? 1,
        },
    })

    // Reset form when dialog opens or data changes
    useEffect(() => {
        if (open) {
            setValue("quantity", initialData?.quantity ?? 1)
        }
    }, [open, initialData, setValue])

    const onSubmit = async (data: FormValues) => {
        try {
            const result = isEdit
                ? await productInventoryService.update(initialData!.id, {
                    productId,
                    quantity: data.quantity,
                    status: 1,
                })
                : await productInventoryService.create({
                    productId,
                    quantity: data.quantity,
                    status: 1,
                })

            if (result.isSuccess) {
                onSuccess()
                onOpenChange(false)
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Unable to save the inventory record",
                    variant: "destructive",
                })
            }
        } catch (err) {
            toast({
                title: "System Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? <Edit3 className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
                        {isEdit ? "Edit Inventory Record" : "Add Inventory Entry"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="quantity" className="text-sm font-medium">
                            Inventory Quantity
                        </label>

                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            placeholder="Enter quantity..."
                            {...register("quantity")}
                            className={errors.quantity ? "border-destructive" : ""}
                        />

                        {errors.quantity && (
                            <p className="text-sm text-destructive">{errors.quantity.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : isEdit
                                    ? "Update"
                                    : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
