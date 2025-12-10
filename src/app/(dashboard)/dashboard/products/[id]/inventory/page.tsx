// src/app/(dashboard)/dashboard/products/[id]/inventory/page.tsx

import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import ProductInventoryList from "@/features/product-inventory/components/product-inventory-list"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { ROUTES } from "@/core/config/routes"

export default async function ProductInventoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const productId = id

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory History</h1>
                    <p className="text-muted-foreground">Manage product stock entries</p>
                </div>

                <div className="flex gap-3">
                    <Link href={ROUTES.PRODUCTS}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    </Link>
                </div>
            </div>

            <ProductInventoryList productId={productId} />
        </div>
    )
}
