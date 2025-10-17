"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Users, Clock, Award } from "lucide-react"
import { badgeService } from "@/entities/badges/services/badge"
import type { BadgeListItem } from "@/entities/badges/types/badge"
import { BadgeFormDialog } from "./badge-form-dialog"
import { useToast } from "@/hooks/use-toast"

export function BadgeList() {
  const { toast } = useToast()
  const [badges, setBadges] = useState<BadgeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<BadgeListItem | null>(null)

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  
  const fetchBadges = async () => {
    try {
      setLoading(true)
      const response = await badgeService.getBadges({
        page,
        limit,
        search: searchTerm,
      })

      setBadges(response.items || [])
      setTotal(response.totalItems || 0)
    } catch (error: any) {
      console.error("Failed to load badges:", error)
      toast({ 
        title: "Error", 
        description: error.message || "Failed to load badges", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [page, limit, searchTerm])

  const getConditionTypeText = (conditionType: number) => {
    const conditions = {
      1: "Total Orders",
      2: "Total Spent", 
      3: "Account Age",
      4: "Specific Achievement"
    }
    return conditions[conditionType as keyof typeof conditions] || "Unknown"
  }

  const getStatusBadge = (badge: BadgeListItem) => {
    if (!badge.isActive) {
      return <Badge variant="outline">Inactive</Badge>
    }
    if (badge.isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (badge.isValid) {
      return <Badge variant="success">Active</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  const handleCreate = () => {
    setEditingBadge(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (badge: BadgeListItem) => {
    setEditingBadge(badge)
    setIsDialogOpen(true)
  }

  const handleDelete = async (badgeId: string) => {
  if (!confirm("Are you sure you want to delete this badge? This action cannot be undone.")) return
  try {
    const result = await badgeService.deleteBadge(badgeId)
    
    if (result.isSuccess) {
      toast({ 
        title: "Success", 
        description: "Badge deleted successfully" 
      })
      await fetchBadges() // Refresh the list
    } else {
      toast({ 
        title: "Error", 
        description: result.message || "Failed to delete badge", 
        variant: "destructive" 
      })
    }
  } catch (error: any) {
    console.error("Delete error:", error)
    toast({ 
      title: "Error", 
      description: error.message || "Failed to delete badge", 
      variant: "destructive" 
    })
  }
}

  // Trong badge-list.tsx - SỬA handleSave function
const handleSave = async (formData: FormData, isEdit: boolean, id?: string) => {
  try {
    if (isEdit && id) {
      await badgeService.updateBadge(id, formData)
      toast({ title: "Success", description: "Badge updated successfully" })
    } else {
      await badgeService.createBadge(formData)
      toast({ title: "Success", description: "Badge created successfully" })
    }
    
    setIsDialogOpen(false)
    await fetchBadges()
  } catch (error: any) {
    console.error("Save error:", error)
    toast({ 
      title: "Error", 
      description: error.message || "Failed to save badge", 
      variant: "destructive" 
    })
  }
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
          <CardTitle>Badges</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Badge
          </Button>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1)
                setSearchTerm(e.target.value)
              }}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Badge</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {badge.iconPath ? (
                        <img
                          src={badge.iconPath}
                          alt={badge.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Award className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      {badge.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {badge.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-green-600">
                    {badge.discountPercentage}% OFF
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {getConditionTypeText(badge.conditionType)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {badge.conditionValue}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {badge.isTimeLimited ? (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(badge.startDate)} - {formatDate(badge.endDate)}
                      </div>
                      {badge.isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Permanent
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Users className="mr-1 h-3 w-3" />
                    {badge.userCount} users
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(badge)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(badge)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDelete(badge.id)}
                      >
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

        {badges.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No badges found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {Math.ceil(total / limit) || 1}
          </span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>

      {isDialogOpen && (
        <BadgeFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingBadge={editingBadge}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}