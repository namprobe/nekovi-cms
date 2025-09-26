"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import type { CreateUserDto } from "@/entities/users/types/user"
import { ROUTES } from "@/core/config/routes"
import { VALIDATION_RULES } from "@/core/config/constants"
import { Loader2, Save, X } from "lucide-react"

interface UserFormProps {
  initialData?: Partial<CreateUserDto>
  isEditing?: boolean
}

const availableRoles = [
  { id: "1", name: "SuperAdmin" },
  { id: "2", name: "Admin" },
  { id: "3", name: "Manager" },
  { id: "4", name: "Staff" },
]

export function UserForm({ initialData, isEditing = false }: UserFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateUserDto>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    userName: initialData?.userName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    password: "",
    roleIds: initialData?.roleIds || [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required"
    } else if (formData.userName.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
      newErrors.userName = `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phoneNumber && !VALIDATION_RULES.PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password && formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = "At least one role must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement API call
      // const response = isEditing
      //   ? await apiClient.put(`/users/${userId}`, formData)
      //   : await apiClient.post('/users', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(ROUTES.USERS)
    } catch {
      setErrors({ general: "Failed to save user. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateUserDto, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
  }

  const handleRoleChange = (roleId: string, checked: boolean) => {
    const newRoleIds = checked ? [...formData.roleIds, roleId] : formData.roleIds.filter((id) => id !== roleId)

    handleInputChange("roleIds", newRoleIds)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit User" : "Create New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={isLoading}
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={isLoading}
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Username *</Label>
            <Input
              id="userName"
              type="text"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              disabled={isLoading}
            />
            {errors.userName && <p className="text-sm text-red-600">{errors.userName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              disabled={isLoading}
            />
            {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!isEditing && "*"}
              {isEditing && <span className="text-sm text-muted-foreground">(leave blank to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="space-y-3">
            <Label>Roles *</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.id}
                    checked={formData.roleIds.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={role.id} className="text-sm font-normal">
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.roleIds && <p className="text-sm text-red-600">{errors.roleIds}</p>}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push(ROUTES.USERS)} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update User" : "Create User"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
