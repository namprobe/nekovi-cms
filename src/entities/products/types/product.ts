// src/entities/products/types/product.ts
import type { BaseEntity } from "@/shared/types/common"
import type { Category } from "@/entities/categories/types/category"

export interface Product extends BaseEntity {
  name: string
  description?: string
  price: number
  discountPrice?: number
  stockQuantity: number
  categoryId: string
  animeSeriesId?: string
  isPreOrder: boolean
  preOrderReleaseDate?: Date
  category?: Category
  animeSeries?: AnimeSeries
  images?: ProductImage[]
  productTags?: ProductTag[]
  inventory?: ProductInventory
  reviews?: ProductReview[]
  events?: EventItem[] // Thêm events để khớp với ProductResponse
  totalSales: number // Bỏ optional để khớp với ProductResponse
  averageRating: number // Bỏ optional để khớp với ProductResponse
  status: number
}



export interface AnimeSeries extends BaseEntity {
  title: string
  description?: string
  imagePath?: string
  releaseYear?: number
  products?: Product[]
}

export interface ProductImage extends BaseEntity {
  productId: string
  imagePath: string
  isPrimary: boolean
  displayOrder: number
  product?: Product
}

export interface ProductInventory extends BaseEntity {
  productId: string
  quantity: number
  product?: Product
}

export interface ProductReview extends BaseEntity {
  productId: string
  userId: string
  rating: number
  title?: string
  comment?: string
  userName?: string // Thêm userName để khớp với ProductReviewResponse
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface Tag extends BaseEntity {
  name: string
  description?: string
  productTags?: ProductTag[]
  postTags?: {
    id: string
    postId: string
    tagId: string
  }[]
}

export interface ProductTag extends BaseEntity {
  productId: string
  tagId: string
  product?: Product
  tag?: Tag
}

export interface EventItem extends BaseEntity {
  name: string
  startDate: Date
  endDate: Date
  imagePath?: string
}

// DTOs
export interface CreateProductDto {
  name: string
  description?: string
  price: number
  discountPrice?: number
  stockQuantity: number
  categoryId: string
  animeSeriesId?: string
  isPreOrder: boolean
  preOrderReleaseDate?: Date
  images: string[]
  tagIds: string[]
  status?: number
  imageIds?: string[]
}

export interface UpdateProductDto {
  name: string
  description?: string
  price: number
  discountPrice?: number
  stockQuantity: number
  categoryId: string
  animeSeriesId?: string
  isPreOrder: boolean
  preOrderReleaseDate?: Date
  images: string[]
  tagIds: string[]
  status?: number
  imageIds?: string[]
}

export interface ProductListItem {
  id: string
  name: string
  price: number
  discountPrice?: number
  stockQuantity: number
  category: {
    name: string
    parentCategoryId?: string
    imagePath?: string
  }
  animeSeriesTitle?: string
  primaryImage?: string
  status: number
  isPreOrder: boolean
}

// ProductResponse giữ nguyên như bạn đã cung cấp
export interface ProductResponse {
  id: string
  name: string
  categoryId: string
  category?: { name: string }
  animeSeriesId?: string
  animeSeries?: { title: string }
  stockQuantity: number
  price: number
  createdAt: Date
  description?: string
  discountPrice?: number
  isPreOrder: boolean
  preOrderReleaseDate?: Date
  images?: { imagePath: string; isPrimary: boolean }[]
  productTags?: { tag: { name: string } }[]
  reviews?: { rating: number; title?: string; comment?: string; userName?: string }[]
  events?: { name: string; startDate: Date; endDate: Date; imagePath?: string }[]
  totalSales: number
  averageRating: number
}