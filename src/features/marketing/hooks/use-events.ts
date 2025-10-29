//src/features/marketing/hooks/use-events.ts
"use client"
import { useState, useEffect } from "react"
import { eventService } from "@/entities/event/services/event"
import type { EventListItem } from "@/entities/event/types/event"

interface ApiResult<T> {
    data?: T
}

interface UseEventDetailResult {
    item: EventListItem | null
    loading: boolean
    error: string | null
}

export function useEventDetail(id?: string): UseEventDetailResult {
    const [item, setItem] = useState<EventListItem | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setError("Event ID is required")
            return
        }

        const fetchEvent = async () => {
            setLoading(true)
            try {
                const response: ApiResult<EventListItem> = await eventService.getEventById(id)
                setItem(response.data ?? null) // Chuyển undefined thành null
                setError(null)
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch event")
                setItem(null)
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [id])

    return { item, loading, error }
}