// src/entities/orders/lib/constants.ts
import { OrderStatus, PaymentStatus } from "@/shared/types/common"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Processing]: "Processing",
  [OrderStatus.Confirmed]: "Confirmed",
  [OrderStatus.Shipping]: "Shipping",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
  [OrderStatus.Returned]: "Returned",
  [OrderStatus.Failed]: "Failed",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.Processing]: "bg-blue-100 text-blue-800",
  [OrderStatus.Confirmed]: "bg-slate-100 text-slate-800",
  [OrderStatus.Shipping]: "bg-purple-100 text-purple-800",
  [OrderStatus.Delivered]: "bg-green-100 text-green-800",
  [OrderStatus.Cancelled]: "bg-red-100 text-red-800",
  [OrderStatus.Returned]: "bg-orange-100 text-orange-800",
  [OrderStatus.Failed]: "bg-gray-200 text-gray-800",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: "Pending",
  [PaymentStatus.Completed]: "Completed",
  [PaymentStatus.Failed]: "Failed",
  [PaymentStatus.Refunded]: "Refunded",
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [PaymentStatus.Completed]: "bg-green-100 text-green-800",
  [PaymentStatus.Failed]: "bg-red-100 text-red-800",
  [PaymentStatus.Refunded]: "bg-orange-100 text-orange-800",
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

export const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

export const DEFAULT_ORDER_FILTER = {
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  isAscending: false,
}

