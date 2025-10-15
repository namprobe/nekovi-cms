//src/entities/event/types/event.ts
import type { BaseEntity } from "@/shared/types/common"

export interface Event extends BaseEntity {
  name: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  isActive: boolean
  featuredImagePath?: string
}

export interface EventListItem {
  id: string
  name: string
  description: string
  startDate: Date
  endDate?: Date
  location: string
  isActive: boolean
  imagePath?: string
  status: number
}

export interface CreateEventDto {
  name: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  isActive: boolean
  imagePath?: string
}

export interface UpdateEventDto {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  isActive?: boolean
  imagePath?: string
}

export interface EventFilter {
  search?: string
  status?: "all" | "active" | "inactive"
  page?: number
  pageSize?: number
}

export interface PaginatedEventList {
  items: EventListItem[]
  total: number
  page: number
  pageSize: number
}

export interface EventResponse {
  id: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  location: string
  status: number
  imagePath?: string
  products?: {
    id: string
    name: string
    price: number
    stockQuantity: number
    primaryImage?: string
    status: number
    category?: { name: string }
  }[]
}