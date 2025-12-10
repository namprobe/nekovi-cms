"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Loader2, Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { userService } from "@/entities/users/services/user"
import type { UserListItem } from "@/entities/users/types/user"
import { useToast } from "@/hooks/use-toast"

interface CustomerSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (userId: string, userEmail: string, userName: string) => void
  selectedUserId?: string
}

export function CustomerSelectorModal({ isOpen, onClose, onSelect, selectedUserId }: CustomerSelectorModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedUserId)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    } else {
      // Reset on close
      setSearchTerm("")
      setPage(1)
      setSelectedId(selectedUserId)
    }
  }, [isOpen, debouncedSearch, page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const result = await userService.getUsers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
      })
      
      if (result.isSuccess) {
        setUsers(result.items)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } else {
        toast({
          title: "Error",
          description: result.errors?.[0] || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    const selectedUser = users.find(u => u.id === selectedId)
    if (selectedUser) {
      onSelect(
        selectedUser.id,
        selectedUser.email,
        `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
      )
      onClose()
    }
  }

  const handleClear = () => {
    onSelect("", "", "")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Table */}
          <ScrollArea className="h-[400px] border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchTerm ? "No customers found matching your search" : "No customers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedId(user.id)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            checked={selectedId === user.id}
                            onChange={() => setSelectedId(user.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                            <img
                              src={user.avatarPath || "/placeholder-avatar.svg"}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.phoneNumber || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalItems)} of {totalItems} customers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedUserId && (
            <Button variant="ghost" onClick={handleClear}>
              Clear Selection
            </Button>
          )}
          <Button onClick={handleSelect} disabled={!selectedId}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

