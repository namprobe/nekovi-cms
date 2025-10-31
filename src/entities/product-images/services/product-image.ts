import { apiClient } from "@/core/lib/api-client"
import type { ApiResult } from "@/shared/types/common"

export const productImageService = {
    createProductImage: (formData: FormData) =>
        apiClient.postFormData<ApiResult<any>>("/product-image", formData),
}
