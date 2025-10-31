// src/app/(dashboard)/dashboard/events/[id]/edit/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { EventForm } from "@/features/marketing/components/event-form"
import { useEventDetail } from "@/features/marketing/hooks/use-events"
import type { UpdateEventDto } from "@/entities/event/types/event"

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params)
  const { item: event, loading, error } = useEventDetail(id)

  if (loading) return <div>Loading...</div>
  if (error || !event) return <div>Error: {error || "Event not found"}</div>

  const initialData: Partial<UpdateEventDto> & { id?: string } = {
    id,
    name: event.name,
    description: event.description,
    startDate: new Date(event.startDate), // Giữ nguyên startDate từ API
    endDate: event.endDate ? new Date(event.endDate) : new Date(),
    location: event.location,
    isActive: event.status === 1,
    imagePath: event.imagePath,
  }

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
        <p className="text-muted-foreground">Update event information and settings.</p>
        <EventForm initialData={initialData} isEditing={true} />
      </div>
    </div>
  )
}