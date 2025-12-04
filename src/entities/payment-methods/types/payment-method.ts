// src/entities/payment-methods/types/payment-method.ts
import type { BaseEntity } from "@/shared/types/common"

export interface PaymentMethod extends BaseEntity {
  name: string
  description?: string
  iconPath?: string
  isOnlinePayment: boolean
  processingFee: number
  processorName?: string
  configuration?: string
  status: number
}

export interface PaymentMethodListItem {
  id: string
  name: string
  iconPath?: string
  isOnlinePayment: boolean
  processingFee: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface PaymentMethodResponse {
  id: string
  name: string
  description?: string
  iconPath?: string
  isOnlinePayment: boolean
  processingFee: number
  processorName?: string
  configuration?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentMethodDto {
  name: string
  description?: string
  iconImage?: File | null
  isOnlinePayment: boolean
  processingFee: number
  processorName?: string
  configuration?: string
  status: number
}

export interface UpdatePaymentMethodDto {
  name: string
  description?: string
  iconImage?: File | null
  isOnlinePayment: boolean
  processingFee: number
  processorName?: string
  configuration?: string
  status: number
}
