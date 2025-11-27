// src/app/(dashboard)/dashboard/home-images/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { HomeImageList } from "@/features/home-image/home-image-list"

export default function Page() {
    return (
        <div>
            <Breadcrumb />
            <HomeImageList />
        </div>
    )
}