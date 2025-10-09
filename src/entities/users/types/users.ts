// ...new file...
import { apiClient } from "@/core/lib/api-client"
import type { UserListItem } from "@/entities/users/types/user"

/**
 * userService.list() - load users from backend
 * Hits: {BASE_URL}{CMS_PREFIX}/users  (apiClient is already configured with base+prefix)
 */
export const userService = {
  list: async (): Promise<UserListItem[]> => {
    const res = await apiClient.get("/users")
    // Try common response shapes:
    if (res?.isSuccess && res.data) {
      const d: any = res.data
      if (Array.isArray(d.users)) return d.users
      if (Array.isArray(d.items)) return d.items
      if (Array.isArray(d)) return d
    }
    return []
  },
}