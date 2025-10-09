/**
 * Utility functions để build FormData từ objects
 * Đặc biệt hữu ích cho việc upload files với backend C# controllers
 */

interface FormDataOptions {
  /**
   * Convert camelCase keys thành PascalCase cho backend C#
   * @default false
   */
  convertToPascalCase?: boolean
  
  /**
   * Bỏ qua các fields null/undefined
   * @default true  
   */
  skipNullish?: boolean
  
  /**
   * Date format cho Date objects
   * @default "YYYY-MM-DD" cho backend C#
   */
  dateFormat?: "iso" | "date-only" | "datetime-local"
}

/**
 * Build FormData từ object với support cho files
 */
export function buildFormData(data: Record<string, unknown>, options: FormDataOptions = {}): FormData {
  const {
    convertToPascalCase = false,
    skipNullish = true,
    dateFormat = "date-only"
  } = options

  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    // Skip null/undefined nếu được config
    if (skipNullish && (value === null || value === undefined)) {
      return
    }

    // Convert key name nếu cần
    const formKey = convertToPascalCase ? toPascalCase(key) : key

    // Handle different value types
    if (value instanceof File) {
      // File object
      formData.append(formKey, value)
    } else if (value instanceof FileList) {
      // Multiple files
      Array.from(value).forEach(file => {
        formData.append(formKey, file)
      })
    } else if (value instanceof Date) {
      // Date object
      formData.append(formKey, formatDate(value, dateFormat))
    } else if (Array.isArray(value)) {
      // Array values
      value.forEach(item => {
        if (item instanceof File) {
          formData.append(formKey, item)
        } else {
          formData.append(formKey, String(item))
        }
      })
    } else if (typeof value === "object" && value !== null) {
      // Nested objects (flatten hoặc JSON.stringify)
      formData.append(formKey, JSON.stringify(value))
    } else {
      // Primitive values
      formData.append(formKey, String(value))
    }
  })

  return formData
}

/**
 * Convert camelCase thành PascalCase cho backend C#
 */
function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format Date object theo format yêu cầu
 */
function formatDate(date: Date, format: FormDataOptions["dateFormat"]): string {
  switch (format) {
    case "iso":
      return date.toISOString()
    case "date-only":
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    case "datetime-local":
      return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    default:
      return date.toISOString().split('T')[0]
  }
}

/**
 * Helper cho Update Profile Request (match với backend UpdateProfileRequest.cs)
 */
export interface UpdateProfileFormData {
  firstName: string
  lastName: string
  phoneNumber: string
  gender: number // GenderEnum
  dateOfBirth: Date
  bio?: string
  avatar?: File | null
}

export function buildUpdateProfileFormData(data: UpdateProfileFormData): FormData {
  const formData = new FormData()

  // Required fields
  formData.append("firstName", data.firstName)
  formData.append("lastName", data.lastName)
  formData.append("phoneNumber", data.phoneNumber)
  formData.append("gender", data.gender.toString())
  formData.append("dateOfBirth", formatDate(data.dateOfBirth, "date-only"))

  // Optional fields
  if (data.bio !== undefined && data.bio !== null) {
    formData.append("bio", data.bio)
  }

  if (data.avatar instanceof File) {
    formData.append("avatar", data.avatar)
  }

  return formData
}

/**
 * Generic helper cho register requests với files
 */
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber: string
  gender?: number
  dateOfBirth?: Date
  [key: string]: unknown
}

export function buildRegisterFormData(data: RegisterFormData): FormData {
  return buildFormData(data, {
    convertToPascalCase: false, // Keep camelCase cho frontend
    skipNullish: true,
    dateFormat: "date-only"
  })
}

/**
 * Debug helper để log FormData contents
 */
export function logFormData(formData: FormData, label = "FormData"): void {
  console.group(`🐛 ${label}`)
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`)
    } else {
      console.log(`${key}:`, value)
    }
  }
  console.groupEnd()
}


// ...existing code...
export function buildCreateUserFormData(payload: {
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  password: string
  roleIds: string[]
  avatarFile?: File | null
  status?: number | null
}): FormData {
  const fd = new FormData()
  fd.append("Email", payload.email ?? "")
  fd.append("FirstName", payload.firstName ?? "")
  fd.append("LastName", payload.lastName ?? "")
  fd.append("PhoneNumber", payload.phoneNumber ?? "")
  fd.append("Password", payload.password ?? "")
  ;(payload.roleIds ?? []).forEach((r) => fd.append("RoleIds", r))
  if (payload.avatarFile) {
    fd.append("AvatarPath", payload.avatarFile)
  } else {
    fd.append("AvatarPath", "") // send empty value per swagger
  }
  fd.append("Status", payload.status != null ? String(payload.status) : "")
  return fd
}
// ...existing code...
