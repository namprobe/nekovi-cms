"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { EventListItem } from "@/entities/event/types/event"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, Calendar, MapPin } from "lucide-react"

// Mock data - replace with actual API call
const mockEvents: EventListItem[] = [
  {
    id: "1",
    title: "Anime Expo 2024",
    description: "The biggest anime convention in North America",
    startDate: new Date("2024-07-04T09:00:00Z"),
    endDate: new Date("2024-07-07T18:00:00Z"),
    location: "Los Angeles Convention Center",
    maxAttendees: 5000,
    currentAttendees: 3200,
    ticketPrice: 75.0,
    isActive: true,
    featuredImagePath: "/anime-expo.jpg",
    status: 1,
  },
  {
    id: "2",
    title: "Cosplay Contest",
    description: "Annual cosplay competition with amazing prizes",
    startDate: new Date("2024-08-15T14:00:00Z"),
    endDate: new Date("2024-08-15T18:00:00Z"),
    location: "Convention Hall A",
    maxAttendees: 500,
    currentAttendees: 287,
    ticketPrice: 25.0,
    isActive: true,
    featuredImagePath: "/cosplay-contest.jpg",
    status: 1,
  },
  {
    id: "3",
    title: "Manga Reading Club",
    description: "Monthly manga discussion and reading session",
    startDate: new Date("2024-09-20T19:00:00Z"),
    endDate: new Date("2024-09-20T21:00:00Z"),
    location: "Community Center",
    maxAttendees: 50,
    currentAttendees: 32,
    ticketPrice: 0,
    isActive: false,
    featuredImagePath: "/manga-club.jpg",
    status: 0,
  },
]

const statusOptions = [
  { value: "all", label: "All Events" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function EventList() {
  const router = useRouter()
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filteredEvents, setFilteredEvents] = useState<EventListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedStatus !== "all") {
      const isActive = selectedStatus === "active"
      filtered = filtered.filter((event) => event.isActive === isActive)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, selectedStatus])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const getAvailabilityBadge = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) {
      return <Badge variant="error">Almost Full</Badge>
    } else if (percentage >= 70) {
      return <Badge variant="warning">Filling Up</Badge>
    } else {
      return <Badge variant="success">Available</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
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
          <CardTitle>Events</CardTitle>
          <Button onClick={() => router.push(ROUTES.EVENT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={event.featuredImagePath || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">{event.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{event.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  {event.endDate && <div className="text-xs text-muted-foreground mt-1">to {formatDate(event.endDate)}</div>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {event.currentAttendees} / {event.maxAttendees}
                    </div>
                    {getAvailabilityBadge(event.currentAttendees, event.maxAttendees)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(event.ticketPrice)}</TableCell>
                <TableCell>{getStatusBadge(event.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(ROUTES.EVENT_DETAIL(event.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.EVENT_DETAIL(event.id))}>
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
