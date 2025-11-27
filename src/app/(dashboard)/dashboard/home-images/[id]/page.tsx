//src/app/(dashboard)/dashboard/home-images/[id]/edit/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { HomeImageForm } from "@/features/home-image/home-image-form"
import { useHomeImageDetail } from "@/entities/home-image/hooks/use-home-image"

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { item, loading, error } = useHomeImageDetail(id)

    if (loading) return <div>Loading...</div>
    if (error || !item) return <div>Error: {error}</div>

    return (
        <div>
            <Breadcrumb />
            <HomeImageForm initialData={item} isEditing={true} />
        </div>
    )
}