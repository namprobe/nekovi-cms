//src/entities/categories/types/category
import type { BaseEntity } from "@/shared/types/common"
import type { Product } from "@/entities/products/types/product"

export interface Category extends BaseEntity {
    name: string
    description: string
    parentCategoryId?: string
    imagePath?: string
    parentCategory?: Category
    subCategories?: Category[]
    products?: Product[]
    status: number // 1: active, 0: inactive, 2: pending
}

export interface CategorySelectOption {
    id: string
    name: string
}