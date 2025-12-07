// src/entities/reports/services/report.ts
import { cmsApiClient } from "@/core/lib/api-client"
import { env } from "@/core/config/env"
import type { DashboardSummaryResponse } from "../types/report"
import type { ApiResult } from "@/shared/types/common"

export const reportService = {
    getDashboardSummary: async (): Promise<ApiResult<DashboardSummaryResponse>> => {
        // Gọi endpoint: /api/cms/reports
        return await cmsApiClient.get<DashboardSummaryResponse>(env.ENDPOINTS.REPORTS)
    },
}