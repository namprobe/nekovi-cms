import type { Product } from "@/entities/products/types/product"

// Payload gửi lên server để lưu (Save)
export interface EventProductSaveRequest {
  productId: string
  isFeatured: boolean
  discountPercentage: number
}

// Dữ liệu trả về từ API get list by event
export interface EventProductWithProductItem {
  id?: string
  eventId: string
  isFeatured: boolean
  discountPercentage: number
  product: Product // Hoặc ProductResponse tùy vào mapping của bạn, cần có id, name, price, imagePath
}

// State dùng trong UI (Form) - kết hợp thông tin cần thiết để hiển thị
export interface EventProductFormItem {
  productId: string
  productName: string
  productImage?: string
  originalPrice: number
  isFeatured: boolean
  discountPercentage: number
  productDiscountPrice: number
}