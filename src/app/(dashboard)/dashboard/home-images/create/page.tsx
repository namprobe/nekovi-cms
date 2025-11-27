// src/app/(dashboard)/dashboard/home-images/create/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { HomeImageForm } from "@/features/home-image/home-image-form"

export default function Page() {
    return (
        <div>
            <Breadcrumb />
            <HomeImageForm />
        </div>
    )
}