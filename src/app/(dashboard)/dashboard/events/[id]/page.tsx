// src/app/(dashboard)/events/[id]/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import EventDetail from "@/features/marketing/components/event-detail"

interface EventViewPageProps {
    params: Promise<{
        id: string
    }>
}

export default function EventViewPage({ params }: EventViewPageProps) {
    const { id } = use(params)

    return (
        <div>
            <Breadcrumb />
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Event Detail</h1>
                <p className="text-muted-foreground">
                    View event information and products included in this event.
                </p>
                <EventDetail eventId={id} />
            </div>
        </div>
    )
}
