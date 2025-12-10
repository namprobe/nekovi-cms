import { apiClient } from "@/core/lib/api-client"
import type { ApiResult } from "@/shared/types/common"
import { env } from "@/core/config/env"

export const productImageService = {
    createProductImage: (formData: FormData) =>
        apiClient.postFormData<ApiResult<any>>(env.ENDPOINTS.PRODUCT_IMAGE.CREATE, formData),
}
