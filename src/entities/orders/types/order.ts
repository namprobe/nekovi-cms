import type { BaseEntity, OrderStatus, PaymentStatus } from "@/shared/types/common"

export interface Order extends BaseEntity {
  orderNumber: string
  userId?: string
  isOneClick: boolean
  guestEmail?: string
  guestFirstName?: string
  guestLastName?: string
  guestPhone?: string
  oneClickAddress?: string
  totalAmount: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  finalAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  notes?: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
  orderItems?: OrderItem[]
  payments?: Payment[]
  shippingMethods?: OrderShippingMethod[]
}

export interface OrderItem extends BaseEntity {
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  discountAmount: number
  order?: Order
  product?: {
    id: string
    name: string
    price: number
    discountPrice?: number
    imagePath?: string
  }
}

export interface Payment extends BaseEntity {
  orderId: string
  paymentMethodId: string
  amount: number
  transactionId?: string
  paymentStatus: PaymentStatus
  paymentDate?: Date
  notes?: string
  processorResponse?: string
  order?: Order
  paymentMethod?: PaymentMethod
}

export interface PaymentMethod extends BaseEntity {
  name: string
  description?: string
  iconPath?: string
  isOnlinePayment: boolean
  processingFee: number
  processorName?: string
  configuration?: string
}

export interface ShippingMethod extends BaseEntity {
  name: string
  description?: string
  cost: number
  estimatedDays?: number
}

export interface OrderShippingMethod extends BaseEntity {
  orderId: string
  shippingMethodId: string
  trackingNumber?: string
  shippedDate?: Date
  deliveredDate?: Date
  order?: Order
  shippingMethod?: ShippingMethod
}

// DTOs
export interface CreateOrderDto {
  userId?: string
  isOneClick: boolean
  guestInfo?: {
    email: string
    firstName: string
    lastName: string
    phone: string
    address: string
  }
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
  paymentMethodId: string
  shippingMethodId: string
  couponCode?: string
  notes?: string
}

export interface OrderListItem {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  finalAmount: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  itemCount: number
}
