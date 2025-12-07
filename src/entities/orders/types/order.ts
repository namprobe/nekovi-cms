import type { BaseEntity, OrderStatus, PaymentStatus, DiscountType } from "@/shared/types/common"

// ============================================
// ORDER LIST ITEM (Map 1:1 với OrderListItem.cs)
// ============================================
export interface OrderListItem extends BaseEntity {
  // User Info
  userId?: string
  userEmail?: string
  userName?: string
  isOneClick: boolean
  guestEmail?: string
  guestName?: string

  // Financial Breakdown
  subtotalOriginal: number
  productDiscountAmount: number
  subtotalAfterProductDiscount: number
  couponDiscountAmount: number
  totalProductAmount: number
  shippingFeeOriginal: number
  shippingDiscountAmount: number
  shippingFeeActual: number
  taxAmount: number
  finalAmount: number

  // Status
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus

  // Summary
  itemCount: number
}

// ============================================
// ORDER ITEM DTO (Map 1:1 với OrderItemDto.cs)
// ============================================
export interface OrderItemDto {
  id: string
  productId: string
  productName: string
  productImageUrl?: string
  quantity: number
  unitPriceOriginal: number
  unitPriceAfterDiscount: number
  unitDiscountAmount: number
  lineTotal: number
}

// ============================================
// ORDER SHIPPING DTO (Map 1:1 với OrderShippingDto.cs)
// ============================================
export interface OrderShippingDto {
  id: string
  shippingMethodId: string
  shippingMethodName?: string
  providerName?: string
  trackingNumber?: string

  // Shipping Address
  userAddressId?: string
  recipientName?: string
  recipientPhone?: string
  address?: string
  wardName?: string
  districtName?: string
  provinceName?: string

  // Shipping Fees
  shippingFeeOriginal: number
  shippingDiscountAmount: number
  shippingFeeActual: number
  isFreeshipping: boolean
  freeshippingNote?: string

  // Additional Fees
  codFee: number
  insuranceFee: number

  // Dates
  estimatedDeliveryDate?: Date
  shippedDate?: Date
  deliveredDate?: Date
}

// ============================================
// ORDER PAYMENT DTO (Map 1:1 với OrderPaymentDto.cs)
// ============================================
export interface OrderPaymentDto {
  id: string
  paymentMethodId: string
  paymentMethodName: string
  amount: number
  transactionNo?: string
  paymentStatus: PaymentStatus
  paymentDate?: Date
  notes?: string
  processorResponse?: string
}

// ============================================
// ORDER COUPON DTO (Map 1:1 với OrderCouponDto.cs)
// ============================================
export interface OrderCouponDto {
  couponId: string
  couponCode: string
  description?: string
  discountType: DiscountType
  discountValue: number
  usedDate?: Date
}

// ============================================
// ORDER DTO (Map 1:1 với OrderDto.cs, extends OrderListItem)
// ============================================
export interface OrderDto extends OrderListItem {
  // Guest Details
  guestFirstName?: string
  guestLastName?: string
  guestPhone?: string
  oneClickAddress?: string

  // Order Details
  notes?: string

  // Items
  orderItems: OrderItemDto[]

  // Shipping
  shipping?: OrderShippingDto

  // Payment
  payment?: OrderPaymentDto

  // Coupons
  appliedCoupons: OrderCouponDto[]
}

// ============================================
// ORDER FILTER (Map 1:1 với OrderFilter.cs)
// ============================================
export interface OrderFilterParams {
  // Pagination (từ BasePaginationFilter)
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  status?: number

  // Order specific filters
  orderNumber?: string
  userId?: string
  userEmail?: string
  guestEmail?: string
  isOneClick?: boolean
  paymentStatus?: PaymentStatus
  orderStatus?: OrderStatus
  minAmount?: number
  maxAmount?: number
  dateFrom?: string // ISO string
  dateTo?: string // ISO string
  hasCoupon?: boolean
  productName?: string
  categoryId?: string
  animeSeriesId?: string
  
  // Index signature for compatibility with PaginationParams
  [key: string]: string | number | boolean | undefined
}
