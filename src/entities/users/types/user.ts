import type { BaseEntity, Gender, AddressType, StaffPosition } from "@/shared/types/common"

export interface User extends BaseEntity {
  firstName: string
  lastName: string
  userName: string
  email: string
  emailConfirmed: boolean
  phoneNumber?: string
  phoneNumberConfirmed: boolean
  lastLoginAt?: Date
  joiningAt: Date
  avatarPath?: string
  twoFactorEnabled: boolean
  lockoutEnd?: Date
  lockoutEnabled: boolean
  accessFailedCount: number
}

export interface Role extends BaseEntity {
  name: string
  normalizedName: string
  description: string
}

export interface UserRole {
  userId: string
  roleId: string
}

export interface CustomerProfile extends BaseEntity {
  userId: string
  dateOfBirth?: Date
  bio?: string
  gender?: Gender
  user?: User
}

export interface StaffProfile extends BaseEntity {
  userId: string
  bio?: string
  gender?: Gender
  hireDate?: Date
  leaveDate?: Date
  leaveReason?: string
  salary?: number
  position?: StaffPosition
  user?: User
}

export interface UserAddress extends BaseEntity {
  userId: string
  addressType: AddressType
  address: string
  city: string
  state?: string
  postalCode: string
  country: string
  phoneNumber?: string
  isDefault: boolean
  user?: User
}

export interface UserAction extends BaseEntity {
  userId: string
  action: UserAction
  entityId?: string
  entityName: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  actionDetail?: string
  user?: User
}

// DTOs for API
export interface CreateUserDto {
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber?: string
  password: string
  roleIds: string[]
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatarPath?: string
}

export interface UserListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  lastLoginAt?: Date
  status: number
  roles: string[]
  avatarPath?: string
}
