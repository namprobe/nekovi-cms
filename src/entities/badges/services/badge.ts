// src/entities/badges/services/badge.ts
import { apiClient } from "@/core/lib/api-client"
import type { Badge, BadgeListItem } from "../types/badge"
import type { PaginateResult, ApiResult } from "@/shared/types/common"

export const badgeService = {
  // Paginated list
  async getBadges(params: { page?: number; limit?: number; search?: string }) {
    return apiClient.paginate<Badge>("/badges", params)
  },

  // Detail
  getBadgeById: (id: string) =>
    apiClient.get<Badge>(`/badges/${id}`),

  // ✅ SỬA: Create badge với FormData
  createBadge: (formData: FormData) =>
    apiClient.postFormData<ApiResult<any>>("/badges", formData),

  // ✅ SỬA: Update badge với FormData
  updateBadge: (id: string, formData: FormData) =>
    apiClient.putFormData<ApiResult<any>>(`/badges/${id}`, formData),

  // Delete badge
  deleteBadge: (id: string) =>
    apiClient.delete<ApiResult<any>>(`/badges/${id}`),
}