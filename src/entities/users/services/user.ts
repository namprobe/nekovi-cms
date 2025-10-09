import { apiClient } from "@/core/lib/api-client"
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
  create: async (payload: CreateUserPayload) => {
    const formData = buildCreateUserFormData(payload)
    // Prefer apiClient.postFormData if implemented; fallback to post
    if (typeof (apiClient as any).postFormData === "function") {
      return (apiClient as any).postFormData("/users", formData)
    }
    // apiClient.post should forward FormData as body and not set JSON Content-Type
    return apiClient.post("/users", formData)
  },
}
 