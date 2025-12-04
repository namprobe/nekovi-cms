// src/entities/shipping-methods/types/shipping-method.ts
import type { BaseEntity } from "@/shared/types/common"

export interface ShippingMethod extends BaseEntity {
  name: string
  description?: string
  cost: number
  estimatedDays?: number
  status: number
}

export interface ShippingMethodListItem {
  id: string
  name: string
  cost: number
  estimatedDays?: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface ShippingMethodResponse {
  id: string
  name: string
  description?: string
  cost: number
  estimatedDays?: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateShippingMethodDto {
  name: string
  description?: string
  cost: number
  estimatedDays?: number
  status: number
}

export interface UpdateShippingMethodDto {
  name: string
  description?: string
  cost: number
  estimatedDays?: number
  status: number
}
