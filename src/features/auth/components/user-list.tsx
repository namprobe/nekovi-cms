"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { UserListItem } from "@/entities/users/types/user"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

// Mock data - replace with actual API call
const mockUsers: UserListItem[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    lastLoginAt: new Date("2024-01-15T10:30:00Z"),
    status: 1,
    roles: ["Admin"],
    avatarPath: undefined,
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+1234567891",
    lastLoginAt: new Date("2024-01-14T15:45:00Z"),
    status: 1,
    roles: ["Manager"],
    avatarPath: undefined,
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    phoneNumber: "+1234567892",
    lastLoginAt: undefined,
    status: 0,
    roles: ["Staff"],
    avatarPath: undefined,
  },
]

export function UserList() {
  const router = useRouter()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some((role) => role.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const formatLastLogin = (date?: Date) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarPath || "/placeholder.svg"} alt={user.firstName} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatLastLogin(user.lastLoginAt)}</TableCell>
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
                      <DropdownMenuItem onClick={() => router.push(ROUTES.USER_DETAIL(user.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
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
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
