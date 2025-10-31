"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUsers } from "@/features/user/hooks/use-users"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Search, Mail, Phone } from "lucide-react"
import { ROUTES } from "@/core/config/routes"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { userService } from "@/entities/users/services/user"
import { useToast } from "@/hooks/use-toast"

export default function UserList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const { items, loading, error, page, limit, setPage, total, refresh } = useUsers({
    page: 1,
    limit: 10,
    search: "",
  })

  const [filteredUsers, setFilteredUsers] = useState(items)
  const { toast } = useToast()

  // Debug để xem cấu trúc data
  useEffect(() => {
    if (items.length > 0) {
      console.log("First user roles structure:", items[0]?.roles)
    }
  }, [items])

  useEffect(() => {
    const filtered = items.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm))
    )
    setFilteredUsers(filtered)
  }, [items, searchTerm])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await userService.deleteUser(id)
      toast({
        title: "Deleted successfully",
        description: "The user has been removed from the list.",
      })
      refresh()
    } catch (err) {
      console.error("Delete user failed:", err)
      toast({
        title: "Delete failed",
        description: "Something went wrong while deleting the user.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Suspended"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatLastLogin = (lastLoginAt?: Date) => {
    if (!lastLoginAt) return "Never"
    return formatDate(lastLoginAt)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button onClick={() => router.push(ROUTES.USER_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={user.avatarPath || "/placeholder-avatar.svg"}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">@{user.firstName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-3 w-3" />
                      {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3" />
                        {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatLastLogin(user.lastLoginAt)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role, index) => (
                      <Badge key={index} 
                        variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.USER_DETAIL(user.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.USER_EDIT(user.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}