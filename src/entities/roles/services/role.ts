import { apiClient } from "@/core/lib/api-client"
 
export interface RoleItem {
  id: string
  name: string
  normalizedName?: string
  description?: string
  status?: number
  statusName?: string
}

export const roleService = {
  list: async (): Promise<RoleItem[]> => {
    const result = await apiClient.get<{ roles: RoleItem[] }>("/role/role")
    if (result?.isSuccess && result.data?.roles) return result.data.roles
    return []
  },
}
// ...new file...