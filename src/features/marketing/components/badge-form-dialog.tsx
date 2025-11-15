// src/features/badges/components/badge-form-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"
import type { BadgeListItem } from "@/entities/badges/types/badge"
import { Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BadgeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingBadge?: BadgeListItem | null
  onSave: (formData: FormData, isEdit: boolean, id?: string) => Promise<void> // ✅ ĐỔI THÀNH FormData
}

// Condition types mapping based on .NET ConditionTypeEnum
const CONDITION_TYPES = [
  { value: "1", label: "Total Orders" },
  { value: "2", label: "Total Spent" },
  { value: "3", label: "Account Age" },
  { value: "4", label: "Specific Achievement" }
]

export function BadgeFormDialog({ open, onOpenChange, editingBadge, onSave }: BadgeFormDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ 
    name: "",
    description: "",
    discountPercentage: "",
    conditionType: "1",
    conditionValue: "",
    isTimeLimited: false,
    startDate: "",
    endDate: "",
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string>("")

  // Reset form when dialog opens/closes or editing badge changes
  useEffect(() => {
    if (editingBadge) {
      setFormData({
        name: editingBadge.name,
        description: editingBadge.description || "",
        discountPercentage: editingBadge.discountPercentage.toString(),
        conditionType: editingBadge.conditionType.toString(),
        conditionValue: editingBadge.conditionValue,
        isTimeLimited: editingBadge.isTimeLimited,
        startDate: editingBadge.startDate ? new Date(editingBadge.startDate).toISOString().split('T')[0] : "",
        endDate: editingBadge.endDate ? new Date(editingBadge.endDate).toISOString().split('T')[0] : "",
        isActive: editingBadge.isActive
      })
      setIconPreview(editingBadge.iconPath || "")
    } else {
      // Set default values for new badge
      const today = new Date().toISOString().split('T')[0]
      const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      setFormData({ 
        name: "",
        description: "",
        discountPercentage: "",
        conditionType: "1",
        conditionValue: "",
        isTimeLimited: false,
        startDate: today,
        endDate: oneMonthLater,
        isActive: true
      })
      setIconPreview("")
    }
    setErrors({})
    setIconFile(null)
  }, [editingBadge, open])

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ iconFile: "Please select an image file" })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ iconFile: "Image size should be less than 2MB" })
        return
      }

      setIconFile(file)
      const previewUrl = URL.createObjectURL(file)
      setIconPreview(previewUrl)
    }
  }

  const removeIcon = () => {
    if (iconPreview.startsWith('blob:')) {
      URL.revokeObjectURL(iconPreview)
    }
    setIconFile(null)
    setIconPreview("")
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Badge name is required"
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = "Badge name must be between 2 and 100 characters"
    }

    // Discount percentage validation
    if (!formData.discountPercentage.trim()) {
      newErrors.discountPercentage = "Discount percentage is required"
    } else {
      const discount = parseFloat(formData.discountPercentage)
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.discountPercentage = "Discount percentage must be between 0 and 100"
      }
    }

    // Condition value validation
    if (!formData.conditionValue.trim()) {
      newErrors.conditionValue = "Condition value is required"
    }

    // Date validation for time-limited badges
    if (formData.isTimeLimited) {
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required for time-limited badges"
      }
      if (!formData.endDate) {
        newErrors.endDate = "End date is required for time-limited badges"
      }
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate)
        const endDate = new Date(formData.endDate)
        if (endDate <= startDate) {
          newErrors.endDate = "End date must be after start date"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getConditionPlaceholder = () => {
    switch (formData.conditionType) {
      case "1": return "e.g., 10 (minimum orders)"
      case "2": return "e.g., 500 (minimum amount spent)"
      case "3": return "e.g., 365 (days since registration)"
      case "4": return "e.g., Complete_First_Order"
      default: return "Enter condition value"
    }
  }

  const getConditionDescription = () => {
    switch (formData.conditionType) {
      case "1": return "Minimum number of orders required"
      case "2": return "Minimum total amount spent required"
      case "3": return "Minimum account age in days"
      case "4": return "Specific achievement identifier"
      default: return ""
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    // ✅ TẠO FormData THAY VÌ JSON
    const formDataToSend = new FormData()
    
    // Append các fields với đúng tên mà backend expect
    formDataToSend.append("Name", formData.name.trim())
    formDataToSend.append("Description", formData.description.trim() || "")
    formDataToSend.append("DiscountPercentage", formData.discountPercentage)
    formDataToSend.append("ConditionType", formData.conditionType)
    formDataToSend.append("ConditionValue", formData.conditionValue.trim())
    formDataToSend.append("IsTimeLimited", formData.isTimeLimited.toString())
    formDataToSend.append("IsActive", formData.isActive.toString())

    // Append dates nếu là time-limited
    if (formData.isTimeLimited) {
      if (formData.startDate) {
        formDataToSend.append("StartDate", formData.startDate + "T00:00:00.000Z")
      }
      if (formData.endDate) {
        formDataToSend.append("EndDate", formData.endDate + "T23:59:59.999Z")
      }
    }

    // Append icon file nếu có
    if (iconFile) {
      formDataToSend.append("IconFile", iconFile)
    }

    // Debug FormData contents
    console.log("📤 FormData contents:")
    for (const [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`  ${key}:`, value)
      }
    }

    setIsLoading(true)
    try {
      await onSave(formDataToSend, !!editingBadge, editingBadge?.id)
      toast({ 
        title: "Success", 
        description: editingBadge ? "Badge updated successfully" : "Badge created successfully" 
      })
      onOpenChange(false)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save badge"
      setErrors({ general: errorMessage })
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (iconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(iconPreview)
      }
    }
  }, [iconPreview])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingBadge ? "Edit Badge" : "Create Badge"}</DialogTitle>
          <DialogDescription>
            {editingBadge
              ? "Update badge details, conditions, and rewards."
              : "Create a new achievement badge with conditions and discount rewards."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

          {/* Badge Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Badge Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., VIP Member, Early Supporter"
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description of this badge"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Icon Upload */}
          <div className="space-y-4">
            <Label>Badge Icon *</Label>
            <div className="flex items-start space-x-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt="Badge icon preview"
                      className="object-cover w-full h-full"
                    />
                  ) : editingBadge?.iconPath ? (
                    <img
                      src={editingBadge.iconPath}
                      alt="Current badge icon"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm text-center">
                      No Icon
                    </div>
                  )}
                </div>
                {(iconPreview || editingBadge?.iconPath) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeIcon}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconChange}
                    disabled={isLoading}
                  />
                  <Label htmlFor="icon-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {iconPreview || editingBadge?.iconPath ? "Change Icon" : "Upload Icon"}
                      </span>
                    </Button>
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  JPG, PNG, SVG up to 2MB. Recommended: 64x64 pixels
                </p>
                {errors.iconFile && <p className="text-sm text-red-600">{errors.iconFile}</p>}
              </div>
            </div>
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Discount Percentage *</Label>
            <Input
              id="discountPercentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.discountPercentage}
              onChange={(e) => handleInputChange("discountPercentage", e.target.value)}
              placeholder="e.g., 10.5"
              disabled={isLoading}
            />
            {errors.discountPercentage && <p className="text-sm text-red-600">{errors.discountPercentage}</p>}
            <p className="text-sm text-gray-500">
              Discount percentage awarded to users who earn this badge (0-100%)
            </p>
          </div>

          {/* Condition Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conditionType">Condition Type *</Label>
              <Select
                value={formData.conditionType}
                onValueChange={(value) => handleInputChange("conditionType", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditionValue">Condition Value *</Label>
              <Input
                id="conditionValue"
                value={formData.conditionValue}
                onChange={(e) => handleInputChange("conditionValue", e.target.value)}
                placeholder={getConditionPlaceholder()}
                disabled={isLoading}
              />
              {errors.conditionValue && <p className="text-sm text-red-600">{errors.conditionValue}</p>}
            </div>
          </div>
          <p className="text-sm text-gray-500 -mt-2">
            {getConditionDescription()}
          </p>

          {/* Time Limited Checkbox */}
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="isTimeLimited"
              checked={formData.isTimeLimited}
              onCheckedChange={(checked) => handleInputChange("isTimeLimited", checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isTimeLimited" className="cursor-pointer">
              Time Limited Badge
            </Label>
          </div>
          <p className="text-sm text-gray-500 -mt-2">
            Enable to set start and end dates for this badge
          </p>

          {/* Date Range - Conditionally shown */}
          {formData.isTimeLimited && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  disabled={isLoading}
                />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  disabled={isLoading}
                />
                {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
          )}

          {/* Active Status Checkbox */}
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active Badge
            </Label>
          </div>
          <p className="text-sm text-gray-500 -mt-2">
            Inactive badges will not be awarded to users
          </p>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {editingBadge ? "Updating..." : "Creating..."}
              </>
            ) : (
              editingBadge ? "Update Badge" : "Create Badge"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}