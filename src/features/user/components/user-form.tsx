"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { userService } from "@/entities/users/services/user"
import { roleService, RoleItem } from "@/entities/roles/services/role"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserFormProps {
  mode?: "create" | "edit"
  userId?: string
}

export function UserForm({ mode = "create", userId }: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [status, setStatus] = useState<number>(1)
  
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(mode === "edit")
  const [error, setError] = useState<string | null>(null)

  // Load roles và user data
  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      // Load roles
      setRolesLoading(true)
      try {
        const roles = await roleService.list()
        if (!mounted) return
        // Normalize roles: đảm bảo id là string và giữ cấu trúc ổn định
        const normalized = (roles || []).map(r => ({
        ...r,
          id: String((r as any).id ?? (r as any)._id ?? ""),
          name: (r as any).name ?? "",
          description: (r as any).description ?? ""
        }))
        setAvailableRoles(normalized)
      } catch (err) {
        console.error("Failed to load roles:", err)
      } finally {
        if (mounted) setRolesLoading(false)
      }

      // Load user data for edit mode
      if (mode === "edit" && userId) {
        setFetchLoading(true)
        try {
          const result = await userService.getUserById(userId)
          if (!mounted) return
          
          if (result.isSuccess && result.data) {
            const user = result.data
            console.log("Loaded user data:", user) // Debug
            //console.log("User roles:", user.roles) // Debug
            
            setEmail(user.email || "")
            setFirstName(user.firstName || "")
            setLastName(user.lastName || "")
            setPhoneNumber(user.phoneNumber || "")
            setStatus(user.status || 1)
            setAvatarPreview(user.avatarPath || "")
            
            // ✅ FIX: Set selected role IDs
            // Normalize + dedupe role ids from user.roles
           //const userRoleIds = Array.from(new Set((user.roles || []).map(r => String((r as any).id ?? (r as any)._id ?? ""))))
            //console.log("Setting selected role IDs (normalized):", userRoleIds) // Debug
            //setSelectedRoleIds(userRoleIds)
          } else {
            setError("Failed to load user data")
          }
        } catch (err: any) {
          setError(err?.message || "Failed to load user")
        } finally {
          if (mounted) setFetchLoading(false)
        }
      }
    }

    loadData()
    return () => { mounted = false }
  }, [mode, userId])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const removeAvatar = () => {
    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const toggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds(prev => {
      const prevSet = new Set(prev.map(String))
      if (checked) {
        prevSet.add(String(roleId))
      } else {
        prevSet.delete(String(roleId))
      }
      return Array.from(prevSet)
    })
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!firstName.trim()) errors.push("First name is required")
    if (!lastName.trim()) errors.push("Last name is required")
    if (selectedRoleIds.length === 0) errors.push("At least one role is required")

    if (mode === "create") {
      if (!email.trim()) errors.push("Email is required")
      else if (!/\S+@\S+\.\S+/.test(email)) errors.push("Please enter a valid email address")
      
      if (!password) errors.push("Password is required")
      else if (password.length < 6) errors.push("Password must be at least 6 characters long")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "))
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        const payload = {
          email,
          firstName,
          lastName,
          phoneNumber: phoneNumber || "",
          password,
          roleIds: selectedRoleIds,
          avatarFile,
          status: status || 1,
        }

        const res = await userService.create(payload)

        if (res?.isSuccess === false) {
          setError(res?.message || "Failed to create user")
        } else {
          toast({
            title: "Success",
            description: "User created successfully",
          })
          router.push(ROUTES.USERS)
        }
      } else {
        // ✅ UPDATE: Update user logic
        const payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
// ensure roleIds are strings and unique
          roleIds: Array.from(new Set(selectedRoleIds.map(String))).filter(Boolean),          status: status,
          avatarFile: avatarFile,
        }

        console.log("Update payload:", payload) // Debug
        console.log("Selected role IDs:", selectedRoleIds) // Debug

        const res = await userService.update(userId!, payload)

        if (res?.isSuccess === false) {
          setError(res?.message || "Failed to update user")
        } else {
          toast({
            title: "Success",
            description: "User updated successfully",
          })
          router.push(ROUTES.USERS)
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading user data...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create New User" : "Edit User"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Avatar Upload - FIXED */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <User className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeAvatar}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                      disabled={loading}
                    />
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, GIF up to 2MB. Recommended: 240x240 pixels
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email {mode === "create" ? "*" : ""}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={mode === "create"}
                    disabled={loading}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="At least 6 characters"
                  minLength={6}
                />
                <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-4">
              <Label>Roles *</Label>
              {rolesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading roles...</span>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-3">
                      {availableRoles.length === 0 && (
                        <div className="text-sm text-muted-foreground">No roles available</div>
                      )}
                      {availableRoles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={selectedRoleIds.includes(role.id)}
                            onCheckedChange={(checked) => toggleRole(role.id, checked as boolean)}
                            disabled={loading}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                              {role.name}
                            </Label>
                            {role.description && (
                              <p className="text-sm text-gray-500">{role.description}</p>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            selectedRoleIds.includes(role.id) 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {selectedRoleIds.includes(role.id) ? "Assigned" : "Not assigned"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected: {selectedRoleIds.length}</strong> of {availableRoles.length} roles
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status.toString()}
                onValueChange={(value) => setStatus(Number(value))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                  <SelectItem value="2">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(ROUTES.USERS)}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === "create" ? "Create User" : "Update User"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



// "use client"

// import React, { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/shared/ui/button"
// import { Input } from "@/shared/ui/input"
// import { Label } from "@/shared/ui/label"
// import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
// import { Alert, AlertDescription } from "@/shared/ui/alert"
// import { Checkbox } from "@/shared/ui/checkbox"
// import type { CreateUserDto, UpdateUserDto } from "@/entities/users/types/user"
// import { ROUTES } from "@/core/config/routes"
// import { VALIDATION_RULES } from "@/core/config/constants"
// import { Loader2, Save, X } from "lucide-react"
// import { roleService, RoleItem } from "@/entities/roles/services/role"
// import { userService } from "@/entities/users/services/user"

// interface UserFormProps {
//   initialData?: Partial<CreateUserDto>
//   isEditing?: boolean
//   userId?: string // when editing, pass user id to load detail
// }

// export function UserForm({ initialData = {}, isEditing = false, userId }: UserFormProps) {
//   const router = useRouter()

//   const [formData, setFormData] = useState<CreateUserDto>({
//     firstName: initialData?.firstName || "",
//     lastName: initialData?.lastName || "",
//     userName: initialData?.userName || "",
//     email: initialData?.email || "",
//     phoneNumber: initialData?.phoneNumber || "",
//     password: "",
//     roleIds: initialData?.roleIds || [],
//     status: initialData?.status || 1, // default to Active
//   })

//   const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [isRolesLoading, setIsRolesLoading] = useState(false)
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   useEffect(() => {
//     let mounted = true
//     const loadRoles = async () => {
//       setIsRolesLoading(true)
//       try {
//         const roles = await roleService.list()
//         if (!mounted) return
//         setAvailableRoles(roles)
//       } catch (err) {
//         console.error("Failed to load roles", err)
//       } finally {
//         if (mounted) setIsRolesLoading(false)
//       }
//     }
//     loadRoles()
//     return () => {
//       mounted = false
//     }
//   }, [])

//   // If editing and userId provided, load user detail and populate fields
//   useEffect(() => {
//     if (!isEditing || !userId) return
//     let mounted = true
//     const loadUser = async () => {
//       setIsLoading(true)
//       try {
//         const res = await userService.getUserById(userId)
//         if (!mounted) return
//         if (res?.isSuccess && res.data) {
//           // res.data is the User object
//           const u: any = res.data
//           setFormData((prev) => ({
//             ...prev,
//             firstName: u.firstName ?? "",
//             lastName: u.lastName ?? "",
//             userName: u.userName ?? "",
//             email: u.email ?? "",
//             phoneNumber: u.phoneNumber ?? "",
//             // password left blank for editing
//             roleIds: (u.roles ?? []).map((r: any) => (typeof r === "string" ? r : (r.id ?? r.roleId ?? ""))).filter(Boolean),
//           }))
//         } else {
//           setErrors({ general: res?.message || "Failed to load user" })
//         }
//       } catch (err: any) {
//         console.error(err)
//         setErrors({ general: err?.message || "Network error" })
//       } finally {
//         if (mounted) setIsLoading(false)
//       }
//     }
//     loadUser()
//     return () => {
//       mounted = false
//     }
//   }, [isEditing, userId])

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {}

//     if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
//     if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
//     if (!formData.userName.trim()) newErrors.userName = "Username is required"
//     if (!formData.email.trim()) newErrors.email = "Email is required"
//     else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) newErrors.email = "Please enter a valid email address"

//     if (!isEditing && !formData.password) newErrors.password = "Password is required"
//     else if (formData.password && formData.password.length > 0 && formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH)
//       newErrors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`

//     if (!formData.roleIds || formData.roleIds.length === 0) newErrors.roleIds = "At least one role must be selected"

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleInputChange = (field: keyof CreateUserDto, value: string | string[]) => {
//     setFormData((prev) => ({ ...prev, [field]: value } as any))
//     if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: "" }))
//     if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
//   }

//   const handleRoleChange = (roleId: string, checked: boolean) => {
//     const newRoleIds = checked ? [...formData.roleIds, roleId] : formData.roleIds.filter((id) => id !== roleId)
//     handleInputChange("roleIds", newRoleIds)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setIsLoading(true)
//     try {
//       if (isEditing && userId) {
//         // Build UpdateUserDto (match backend UpdateUserRequest)
//         const payload: UpdateUserDto = {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email || undefined,
//           phoneNumber: formData.phoneNumber || undefined,
//           avatarPath: undefined, // keep as is unless you add file upload
//           roleIds: formData.roleIds, // array of GUID strings
//           status: 1, // choose appropriate status or provide UI control; using 1(Active) as default
//         }

//         const res = await userService.updateUser(userId, payload)
//         if (res?.isSuccess) {
//           router.push(ROUTES.USERS)
//         } else {
//           setErrors({ general: res?.message || "Failed to update user" })
//         }
//       } else {
//         // Create new user flow (existing create behavior)
//         // If your backend requires FormData for avatar, call createUserForm; else call create JSON endpoint
//         // For minimal change, reuse createUserForm with FormData if you implemented earlier
//         // (left as TODO if you prefer JSON)
//         // TODO: implement create flow if needed
//         setErrors({ general: "Create user not implemented in this form. Use create flow." })
//       }
//     } catch (err: any) {
//       console.error(err)
//       setErrors({ general: err?.message ?? "Network error occurred" })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card className="max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle>{isEditing ? "Edit User" : "Create New User"}</CardTitle>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {errors.general && (
//             <Alert variant="destructive">
//               <AlertDescription>{errors.general}</AlertDescription>
//             </Alert>
//           )}

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="firstName">First Name *</Label>
//               <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} disabled={isLoading} />
//               {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
//             </div>

//             <div>
//               <Label htmlFor="lastName">Last Name *</Label>
//               <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} disabled={isLoading} />
//               {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="userName">Username *</Label>
//             <Input id="userName" value={formData.userName} onChange={(e) => handleInputChange("userName", e.target.value)} disabled={isLoading} />
//             {errors.userName && <p className="text-sm text-red-600">{errors.userName}</p>}
//           </div>

//           <div>
//             <Label htmlFor="email">Email *</Label>
//             <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} disabled={isLoading} />
//             {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
//           </div>

//           <div>
//             <Label htmlFor="phoneNumber">Phone Number</Label>
//             <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} disabled={isLoading} />
//             {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
//           </div>

//           <div>
//             <Label htmlFor="password">Password {!isEditing && "*"}</Label>
//             <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} disabled={isLoading} />
//             {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
//           </div>

//           <div>
//             <Label>Roles *</Label>
//             {isRolesLoading ? (
//               <div className="text-sm text-muted-foreground">Loading roles...</div>
//             ) : (
//               <div className="grid grid-cols-2 gap-2">
//                 {availableRoles.map((role) => {
//                   const checked = formData.roleIds.includes(role.id)
//                   return (
//                     <div key={role.id} className="flex items-center space-x-2">
//                       <Checkbox id={role.id} checked={checked} onCheckedChange={(c) => handleRoleChange(role.id, Boolean(c))} disabled={isLoading} />
//                       <Label htmlFor={role.id} className="text-sm font-normal">{role.name}</Label>
//                     </div>
//                   )
//                 })}
//               </div>
//             )}
//             {errors.roleIds && <p className="text-sm text-red-600">{errors.roleIds}</p>}
//           </div>

//           <div className="flex items-center justify-end space-x-4 pt-6">
//             <Button type="button" variant="outline" onClick={() => router.push(ROUTES.USERS)} disabled={isLoading}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
//               {isEditing ? "Save changes" : "Create user"}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }