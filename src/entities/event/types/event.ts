import type { BaseEntity } from "@/shared/types/common"

export interface Event extends BaseEntity {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  maxAttendees: number
  currentAttendees: number
  ticketPrice: number
  isActive: boolean
  featuredImagePath?: string
}

export interface EventListItem {
  id: string
  title: string
  description: string
  startDate: Date
  endDate?: Date
  location: string
  maxAttendees: number
  currentAttendees: number
  ticketPrice: number
  isActive: boolean
  featuredImagePath?: string
  status: number
}

export interface CreateEventDto {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  maxAttendees: number
  ticketPrice: number
  isActive: boolean
  featuredImagePath?: string
}

export interface UpdateEventDto {
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  location?: string
  maxAttendees?: number
  ticketPrice?: number
  isActive?: boolean
  featuredImagePath?: string
}
