// src/entities/shipping/services/shipping-webhook.ts

import { env } from "@/core/config/env"
import { rootApiClient } from "@/core/lib/api-client"
import type { ApiResult } from "@/shared/types/common"
import type { GHNCallbackPayload } from "../types/ghn-callback"

export const shippingWebhookService = {
    /** Simulate GHN webhook callback (uses /api/shipping-order/ghn/simulate-callback) */
    simulateGHNCallback: (payload: GHNCallbackPayload): Promise<ApiResult<unknown>> => {
        return rootApiClient.post(env.ENDPOINTS.SHIPPING_ORDER.SIMULATE_CALLBACK, payload)
    },
}

