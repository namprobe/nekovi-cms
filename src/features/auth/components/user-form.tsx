// ...existing code...
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { userService } from "@/entities/users/services/user"
import { roleService, RoleItem } from "@/entities/roles/services/role"

export function UserForm({ initial = {} as any }: { initial?: any }) {
  const router = useRouter()
  const [email, setEmail] = useState(initial.email ?? "")
  const [firstName, setFirstName] = useState(initial.firstName ?? "")
  const [lastName, setLastName] = useState(initial.lastName ?? "")
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber ?? "")
  const [password, setPassword] = useState("")
  // removed roleIdsText; using selectedRoleIds + availableRoles
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(initial.roleIds ?? [])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [status, setStatus] = useState<number | "">((initial.status ?? "") as any)
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadRoles = async () => {
      setRolesLoading(true)
      try {
        const roles = await roleService.list()
        if (!mounted) return
        setAvailableRoles(roles || [])
      } catch {
        // ignore or set simple message
      } finally {
        if (mounted) setRolesLoading(false)
      }
    }
    loadRoles()
    return () => {
      mounted = false
    }
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    setAvatarFile(f ?? null)
  }

  const toggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      if (checked) return Array.from(new Set([...prev, roleId]))
      return prev.filter((id) => id !== roleId)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !firstName || !lastName || !password || selectedRoleIds.length === 0) {
      setError("Please fill required fields: Email, FirstName, LastName, Password and select at least one Role.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || "",
        password,
        roleIds: selectedRoleIds,
        avatarFile,
        status: status === "" ? null : Number(status),
      }

      const res = await userService.create(payload)

      if (res?.isSuccess === false) {
        setError(res?.message || "Failed to create user")
      } else {
        router.push("/dashboard/users")
      }
    } catch (err: any) {
      setError(err?.message ?? "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm">Email *</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm">First Name *</label>
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm">Last Name *</label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm">Phone Number</label>
        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm">Password *</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div>
        <Label>Roles *</Label>
        {rolesLoading ? (
          <div className="text-sm text-muted-foreground">Loading roles...</div>
        ) : (
          <div className="grid gap-2">
            {availableRoles.length === 0 && <div className="text-sm text-muted-foreground">No roles available</div>}
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.id}
                  checked={selectedRoleIds.includes(role.id)}
                  onCheckedChange={(checked) => toggleRole(role.id, Boolean(checked))}
                />
                <label htmlFor={role.id} className="text-sm">
                  {role.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm">Avatar (file)</label>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <div>
        <label className="block text-sm">Status</label>
        <Input type="number" value={status as any} onChange={(e) => setStatus(e.target.value === "" ? "" : Number(e.target.value))} />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
      </div>
    </form>
  )
}
// ...existing code...