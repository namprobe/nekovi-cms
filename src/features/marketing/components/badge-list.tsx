"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
// import type { BadgeListItem } from "@/shared/types/event"
interface BadgeListItem {
  id: string
  name: string
  description?: string
  imagePath?: string
  iconPath?: string
  criteria?: string
  status: number
  awardedCount: number
}
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Users } from "lucide-react"

// Mock data - replace with actual API call
const mockBadges: BadgeListItem[] = [
  {
    id: "1",
    name: "First Purchase",
    description: "Awarded for making your first purchase",
    iconPath: "/badge-first-purchase.png",
    criteria: "Complete first order",
    awardedCount: 1250,
    status: 1,
  },
  {
    id: "2",
    name: "Anime Expert",
    description: "Awarded for purchasing 10+ anime items",
    iconPath: "/badge-anime-expert.png",
    criteria: "Purchase 10 or more anime products",
    awardedCount: 89,
    status: 1,
  },
  {
    id: "3",
    name: "Loyal Customer",
    description: "Awarded for being a customer for 1+ years",
    iconPath: "/badge-loyal-customer.png",
    criteria: "Account active for 365+ days",
    awardedCount: 456,
    status: 1,
  },
  {
    id: "4",
    name: "Big Spender",
    description: "Awarded for spending $500+ in total",
    iconPath: "/badge-big-spender.png",
    criteria: "Total lifetime spending >= $500",
    awardedCount: 23,
    status: 0,
  },
]

export function BadgeList() {
  const router = useRouter()
  const [badges, setBadges] = useState<BadgeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredBadges, setFilteredBadges] = useState<BadgeListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBadges(mockBadges)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const filtered = badges.filter(
      (badge) =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.criteria?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredBadges(filtered)
  }, [badges, searchTerm])

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="neutral">Inactive</Badge>
    )
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
          <Button onClick={() => router.push(ROUTES.BADGE_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Badge
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search badges..."
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
              <TableHead>Badge</TableHead>
              <TableHead>Criteria</TableHead>
              <TableHead>Awarded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBadges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={badge.iconPath || "/placeholder.svg"}
                        alt={badge.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{badge.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs line-clamp-2 text-sm">{badge.criteria}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{badge.awardedCount}</span>
                    <span className="text-sm text-muted-foreground">users</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(badge.status === 1)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.BADGE_DETAIL(badge.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.BADGE_DETAIL(badge.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
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

        {filteredBadges.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No badges found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
