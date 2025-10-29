import type { BaseEntity } from "@/shared/types/common"

export interface Badge extends BaseEntity {
  name: string
  description?: string
  iconPath?: string
  discountPercentage: number
  conditionType: number // ConditionTypeEnum
  conditionValue: string
  isTimeLimited: boolean
  startDate?: Date
  endDate?: Date
  userCount: number
  isActive: boolean
  isExpired: boolean
  isValid: boolean
}

export interface CreateBadgeRequest {
  name: string
  description?: string
  iconPath?: string
  discountPercentage: number
  conditionType: number
  conditionValue: string
  isTimeLimited: boolean
  startDate?: Date
  endDate?: Date
  isActive: boolean
}

export interface UpdateBadgeRequest {
  name: string
  description?: string
  iconPath?: string
  discountPercentage: number
  conditionType: number
  conditionValue: string
  isTimeLimited: boolean
  startDate?: Date
  endDate?: Date
  isActive: boolean
}

export interface BadgeListItem {
  id: string
  name: string
  description?: string
  iconPath?: string
  discountPercentage: number
  conditionType: number
  conditionValue: string
  isTimeLimited: boolean
  startDate?: Date
  endDate?: Date
  userCount: number
  isActive: boolean
  isExpired: boolean
  isValid: boolean
}