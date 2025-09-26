import type { ApiResult, ErrorCodeEnum } from "@/shared/types/common"
import { getHttpStatusFromErrorCode } from "@/shared/types/common"

export interface ApiError {
  message: string
  statusCode: number
  errorCode?: string
  errors?: string[]
}

export class ApiErrorHandler {
  static handleError<T>(result: ApiResult<T>): ApiError {
    const statusCode = result.errorCode 
      ? getHttpStatusFromErrorCode(result.errorCode)
      : 500

    return {
      message: result.message || "An error occurred",
      statusCode,
      errorCode: result.errorCode,
      errors: result.errors,
    }
  }

  static isNetworkError(result: ApiResult<any>): boolean {
    return result.errorCode === "NETWORK_ERROR" || result.errorCode === "TIMEOUT"
  }

  static isAuthError(result: ApiResult<any>): boolean {
    const authErrorCodes = ["1001", "1002", "1003", "1004", "1005"]
    return authErrorCodes.includes(result.errorCode || "")
  }

  static isValidationError(result: ApiResult<any>): boolean {
    const validationErrorCodes = ["2001", "2002", "2003", "2004"]
    return validationErrorCodes.includes(result.errorCode || "")
  }

  static shouldRetry(result: ApiResult<any>): boolean {
    // Retry cho network errors và timeout
    return this.isNetworkError(result)
  }

  static getErrorMessage(result: ApiResult<any>): string {
    if (result.message) return result.message
    
    if (this.isNetworkError(result)) {
      return "Connection failed. Please check your internet connection."
    }
    
    if (this.isAuthError(result)) {
      return "Authentication failed. Please login again."
    }
    
    if (this.isValidationError(result)) {
      return "Invalid input. Please check your data."
    }
    
    return "An unexpected error occurred."
  }
}