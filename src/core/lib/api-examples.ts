/**
 * EXAMPLES - Cách sử dụng API Client với backend C# patterns
 * File này chỉ để tham khảo, không import vào production code
 */

import { apiClient } from "./api-client"
import { buildFormData, buildUpdateProfileFormData, logFormData } from "./form-data-builder"
import type { ApiResult, PaginateResult } from "@/shared/types/common"

// ========================================
// 1. PAGINATION EXAMPLES 
// Backend trả về PaginateResult trực tiếp
// ========================================

interface PaymentMethodItem {
  id: string
  name: string
  processingFee: number
  isOnlinePayment: boolean
}

async function getPaymentMethodsExample() {
  // Pagination với search và filters
  const result: PaginateResult<PaymentMethodItem> = await apiClient.paginate("/payment-methods", {
    page: 1,
    pageSize: 10,
    search: "credit card",
    sortBy: "name",
    sortOrder: "asc",
    // Custom filters
    isOnlinePayment: true,
    minProcessingFee: 0,
    maxProcessingFee: 100
  })

  if (result.isSuccess) {
    console.log(`Found ${result.totalItems} payment methods`)
    console.log(`Page ${result.currentPage} of ${result.totalPages}`)
    console.log("Items:", result.items)
  } else {
    console.error("Error:", result.errors)
  }
}

// ========================================
// 2. FORM DATA EXAMPLES
// POST/PUT với files (IFormFile)
// ========================================

async function updateProfileExample() {
  // Cách 1: Sử dụng helper function
  const profileData = {
    firstName: "John",
    lastName: "Doe", 
    phoneNumber: "+1234567890",
    gender: 1, // Male
    dateOfBirth: new Date("1990-01-15"),
    bio: "Software developer",
    avatar: new File([""], "avatar.jpg", { type: "image/jpeg" }) // From file input
  }

  const formData = buildUpdateProfileFormData(profileData)
  
  // Debug: xem FormData contents
  logFormData(formData, "Update Profile")

  const result = await apiClient.putFormData<void>("/auth/update-profile", formData)

  if (result.isSuccess) {
    console.log("Profile updated successfully!")
  } else {
    console.error("Update failed:", result.message)
  }
}

async function registerWithAvatarExample() {
  // Cách 2: Build FormData manually cho register
  const registerData = {
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
    firstName: "Jane",
    lastName: "Smith",
    phoneNumber: "+1234567891",
    gender: 2, // Female
    dateOfBirth: new Date("1995-05-20")
  }

  const formData = buildFormData(registerData, {
    skipNullish: true,
    dateFormat: "date-only"
  })

  const result = await apiClient.postFormData<void>("/auth/register", formData)

  if (result.isSuccess) {
    console.log("Registration successful!")
  } else {
    console.error("Registration failed:", result.errors)
  }
}

// ========================================
// 3. REGULAR JSON API EXAMPLES  
// Với Result<T> pattern
// ========================================

interface LoginRequest {
  email: string
  password: string
  grantType: number
}

interface AuthResponse {
  accessToken: string
  expiresAt: string
  roles: string[]
}

async function loginExample() {
  const loginData: LoginRequest = {
    email: "admin@example.com",
    password: "Admin@123",
    grantType: 0 // Password
  }

  const result: ApiResult<AuthResponse> = await apiClient.post("/auth/login", loginData)

  if (result.isSuccess && result.data) {
    console.log("Login successful!")
    console.log("Token:", result.data.accessToken)
    console.log("Roles:", result.data.roles)
    
    // Set token cho các requests tiếp theo
    apiClient.setToken(result.data.accessToken)
  } else {
    console.error("Login failed:", result.message)
  }
}

async function getUserProfileExample() {
  const result: ApiResult<{ firstName: string; lastName: string; email: string }> = await apiClient.get("/auth/profile")

  if (result.isSuccess && result.data) {
    console.log("User profile:", result.data)
  } else {
    console.error("Failed to get profile:", result.message)
  }
}

// ========================================
// 4. FILE UPLOAD EXAMPLES
// Single file với progress tracking
// ========================================

async function uploadFileWithProgressExample() {
  const fileInput = document.getElementById("file-input") as HTMLInputElement
  const file = fileInput.files?.[0]

  if (!file) return

  const result = await apiClient.uploadFile(
    "/upload/avatar",
    file,
    (progress) => {
      console.log(`Upload progress: ${progress.toFixed(1)}%`)
      // Update progress bar UI
    }
  )

  if (result.isSuccess) {
    console.log("File uploaded successfully!")
  } else {
    console.error("Upload failed:", result.message)
  }
}

// ========================================
// 5. ERROR HANDLING EXAMPLES
// ========================================

import { ApiErrorHandler } from "./api-error-handler"

async function errorHandlingExample() {
  const result = await apiClient.post("/some-endpoint", { data: "test" })

  if (!result.isSuccess) {
    const error = ApiErrorHandler.handleError(result)
    
    console.log("Status Code:", error.statusCode)
    console.log("Error Code:", error.errorCode)
    console.log("Message:", error.message)
    
    // Handle specific error types
    if (ApiErrorHandler.isAuthError(result)) {
      console.log("Authentication error - redirect to login")
      // redirect to login
    } else if (ApiErrorHandler.isValidationError(result)) {
      console.log("Validation error - show field errors")
      console.log("Field errors:", error.errors)
    } else if (ApiErrorHandler.isNetworkError(result)) {
      console.log("Network error - show retry option")
    }
  }
}

// ========================================
// 6. TYPESCRIPT INTEGRATION EXAMPLES
// ========================================

// Define your API response types
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

async function typedApiExample() {
  // Strongly typed requests and responses
  const newUser: CreateUserRequest = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123"
  }

  const createResult: ApiResult<User> = await apiClient.post<User>("/users", newUser)
  
  if (createResult.isSuccess && createResult.data) {
    const user: User = createResult.data // TypeScript knows this is User type
    console.log(`Created user: ${user.firstName} ${user.lastName}`)
  }

  // Paginated with typed results
  const usersResult: PaginateResult<User> = await apiClient.paginate<User>("/users", {
    page: 1,
    pageSize: 20,
    search: "john"
  })

  if (usersResult.isSuccess) {
    usersResult.items.forEach(user => {
      console.log(`User: ${user.firstName} ${user.lastName}`) // TypeScript auto-complete
    })
  }
}

// Export examples cho documentation (optional)
export const apiExamples = {
  getPaymentMethodsExample,
  updateProfileExample,
  registerWithAvatarExample,
  loginExample,
  getUserProfileExample,
  uploadFileWithProgressExample,
  errorHandlingExample,
  typedApiExample
}
