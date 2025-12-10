import type { BaseEntity } from "@/shared/types/common"

export interface Tag extends BaseEntity {
    name: string
    description?: string
    status: number // 1 = Active, 0 = Inactive
}

export interface TagSelectItem {
    id: string
    name: string
}