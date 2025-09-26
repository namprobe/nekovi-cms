import type { BaseEntity } from "@/shared/types/common"

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
  tags?: ProductTag[]
  inventory?: ProductInventory
  reviews?: ProductReview[]
}

export interface Category extends BaseEntity {
  name: string
  description: string
  parentCategoryId?: string
  imagePath?: string
  parentCategory?: Category
  subCategories?: Category[]
  products?: Product[]
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
  product?: Product
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
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  discountPrice?: number
  stockQuantity?: number
  categoryId?: string
  animeSeriesId?: string
  isPreOrder?: boolean
  preOrderReleaseDate?: Date
}

export interface ProductListItem {
  id: string
  name: string
  price: number
  discountPrice?: number
  stockQuantity: number
  categoryName: string
  animeSeriesTitle?: string
  primaryImage?: string
  status: number
  isPreOrder: boolean
}
