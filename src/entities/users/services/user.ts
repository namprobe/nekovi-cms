import { apiClient } from "@/core/lib/api-client"
import type {
    User,
    UserListItem,
    CreateUserDto,
    UpdateUserDto,
    UserResponse
} from "@/entities/users/types/user"
import type { PaginateResult, ApiResult } from "@/shared/types/common"
import { buildCreateUserFormData } from "@/core/lib/form-data-builder"


export type CreateUserPayload = {
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  password: string
  roleIds: string[]
  avatarFile?: File | null
  status?: number | null
}

export const userService = {
    // Paginated list
    async getUsers(params: { page?: number; limit?: number; search?: string }) {
        return apiClient.paginate<UserListItem[]>("/users", params)
    },

    // Detail
    getUserById: (id: string) =>
        apiClient.get<UserResponse>(`/users/${id}`),

    // Create user
    createUser: (data: CreateUserDto) =>
        apiClient.post<ApiResult<any>>("/users", data),

    create: async (payload: CreateUserPayload) => {
    const formData = buildCreateUserFormData(payload)
    // Prefer apiClient.postFormData if implemented; fallback to post
    if (typeof (apiClient as any).postFormData === "function") {
      return (apiClient as any).postFormData("/users", formData)
    }
    // apiClient.post should forward FormData as body and not set JSON Content-Type
    return apiClient.post("/users", formData)
  },

    // Update user
    updateUser: (id: string, data: UpdateUserDto) =>
        apiClient.put<ApiResult<any>>(`/users/${id}`, data),

    // Delete user
    deleteUser: (id: string) =>
        apiClient.delete<ApiResult<any>>(`/users/${id}`),

    // Update user status (activate/deactivate)
    updateUserStatus: (id: string, status: number) =>
        apiClient.patch<ApiResult<any>>(`/users/${id}/status`, { status }),

    // Assign roles to user
    assignRoles: (id: string, roleIds: string[]) =>
        apiClient.post<ApiResult<any>>(`/users/${id}/roles`, { roleIds }),
}