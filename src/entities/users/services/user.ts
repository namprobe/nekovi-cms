import { apiClient } from "@/core/lib/api-client"
import type {
    User,
    UserListItem,
    CreateUserDto,
    UpdateUserDto,
    UserResponse,
    UpdateUserRequest,
    UpdateUserPayload
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
    // Trong user-service.ts
getUserById: (id: string) => {
  console.log("🔍 Fetching user with ID:", id) // DEBUG
  return apiClient.get<UserResponse>(`/users/${id}`)
},
    // getUserById: (id: string) =>
    //     apiClient.get<UserResponse>(`/users/${id}`),

    // Create user
    createUser: (data: CreateUserDto) =>
        apiClient.post<ApiResult<any>>("/users", data),

    create: async (payload: CreateUserPayload) => {
        const formData = buildCreateUserFormData(payload)
        if (typeof (apiClient as any).postFormData === "function") {
            return (apiClient as any).postFormData("/users", formData)
        }
        return apiClient.post("/users", formData)
    },

    // ✅ UPDATE: Update user với JSON payload
    updateUser: (id: string, data: UpdateUserRequest) => {
        console.log("Sending update payload:", data) // Debug
        return apiClient.put<ApiResult<any>>(`/users/${id}`, {
            ...data,
            roleIds: data.roleIds || [] // ✅ Đảm bảo roleIds không bị undefined
        })
    },



    // ✅ SỬA: Update user với JSON payload
  update: async (id: string, payload: UpdateUserPayload) => {
    console.log("🔄 UPDATE USER - ID:", id)
    console.log("📤 Update payload:", payload)
    
    // Tạo JSON payload đúng như swagger
    const jsonPayload = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email, // ✅ Giữ nguyên (có thể là string, null, hoặc undefined)
      phoneNumber: payload.phoneNumber,
      avatarPath: payload.avatarPath,
      roleIds: payload.roleIds,
      status: payload.status
    }

    console.log("📝 JSON payload for backend:", jsonPayload)

    try {
      console.log("🚀 Sending PUT request with JSON...")
      const result = await apiClient.put(`/users/${id}`, jsonPayload)
      console.log("✅ Update response:", result)
      return result
    } catch (error) {
      console.error("❌ Update error:", error)
      throw error
    }
  },

  // ✅ THÊM: Separate method cho upload avatar (nếu backend có endpoint riêng)
  updateAvatar: async (id: string, avatarFile: File) => {
    const formData = new FormData()
    formData.append("avatar", avatarFile)
    
    return apiClient.putFormData(`/users/${id}/avatar`, formData)
  },
    // // ✅ UPDATE: Update user với FormData (nếu có file)
    // update: async (id: string, payload: UpdateUserPayload) => {
    //     const formData = new FormData()
        
    //     // ✅ Append các fields với đúng tên mà backend expect
    //     formData.append("FirstName", payload.firstName)
    //     formData.append("LastName", payload.lastName)
    //     if (payload.email) formData.append("Email", payload.email)
    //     if (payload.phoneNumber) formData.append("PhoneNumber", payload.phoneNumber)
    //     formData.append("Status", payload.status.toString())
        
    //     // ✅ Append roleIds với đúng format
    //     payload.roleIds.forEach(roleId => {
    //         formData.append("RoleIds", roleId)
    //     })
        
    //     if (payload.avatarFile) {
    //         formData.append("AvatarPath", payload.avatarFile)
    //     }

    //     console.log("Update FormData contents:") // Debug
    //     for (const [key, value] of formData.entries()) {
    //         console.log(`${key}:`, value)
    //     }

    //     if (typeof (apiClient as any).putFormData === "function") {
    //         return (apiClient as any).putFormData(`/users/${id}`, formData)
    //     }
    //     return apiClient.put(`/users/${id}`, formData)
    // },

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


// import { apiClient } from "@/core/lib/api-client"
// import type {
//     User,
//     UserListItem,
//     CreateUserDto,
//     UpdateUserDto,
//     UserResponse
// } from "@/entities/users/types/user"
// import type { PaginateResult, ApiResult } from "@/shared/types/common"
// import { buildCreateUserFormData } from "@/core/lib/form-data-builder"


// export type CreateUserPayload = {
//   email: string
//   firstName: string
//   lastName: string
//   phoneNumber?: string | null
//   password: string
//   roleIds: string[]
//   avatarFile?: File | null
//   status?: number | null
// }

// export const userService = {
//     // Paginated list
//     async getUsers(params: { page?: number; limit?: number; search?: string }) {
//         return apiClient.paginate<UserListItem[]>("/users", params)
//     },

//     // Detail
//     getUserById: (id: string) =>
//         apiClient.get<UserResponse>(`/users/${id}`),

//     // Create user
//     createUser: (data: CreateUserDto) =>
//         apiClient.post<ApiResult<any>>("/users", data),

//     create: async (payload: CreateUserPayload) => {
//     const formData = buildCreateUserFormData(payload)
//     // Prefer apiClient.postFormData if implemented; fallback to post
//     if (typeof (apiClient as any).postFormData === "function") {
//       return (apiClient as any).postFormData("/users", formData)
//     }
//     // apiClient.post should forward FormData as body and not set JSON Content-Type
//     return apiClient.post("/users", formData)
//   },

//     // Update user
//     updateUser: (id: string, data: UpdateUserDto) =>
//         apiClient.put<ApiResult<any>>(`/users/${id}`, data),

//     // Delete user
//     deleteUser: (id: string) =>
//         apiClient.delete<ApiResult<any>>(`/users/${id}`),

//     // Update user status (activate/deactivate)
//     updateUserStatus: (id: string, status: number) =>
//         apiClient.patch<ApiResult<any>>(`/users/${id}/status`, { status }),

//     // Assign roles to user
//     assignRoles: (id: string, roleIds: string[]) =>
//         apiClient.post<ApiResult<any>>(`/users/${id}/roles`, { roleIds }),
// }