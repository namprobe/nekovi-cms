// src/entities/dashboard/services/dashboard.ts
import { env } from "@/core/config/env";
import { cmsApiClient } from "@/core/lib/api-client";
import { DashboardData } from "../types/dashboard";
import { ApiResult } from "@/shared/types/common";

export const dashboardService = {
    getDashboardData: async (): Promise<ApiResult<DashboardData>> => {
        return await cmsApiClient.get<DashboardData>(env.ENDPOINTS.DASHBOARD);
    }
};