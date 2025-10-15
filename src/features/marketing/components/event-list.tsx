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
import { eventService } from "@/entities/event/services/event"
import { useToast } from "@/hooks/use-toast"

const statusOptions = [
  { value: "all", label: "All Events" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function EventList() {
  const router = useRouter()
  const { toast } = useToast()

  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all")
  const [filteredEvents, setFilteredEvents] = useState<EventListItem[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // map "all" thành undefined để API hiểu lấy tất cả
      const statusParam = selectedStatus === "all" ? undefined : selectedStatus

      const response = await eventService.getEvents({
        page,
        pageSize: limit,
        search: searchTerm,
        status: statusParam,
      })

      if (response.isSuccess && response.data) {
        setEvents(response.data.items)
        setTotal(response.data.total)
      } else {
        setEvents([])
        setTotal(0)
        toast({
          title: "Error",
          description: response.message || "Failed to load events",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchEvents()
  }, [page, searchTerm, selectedStatus])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  // map isActive boolean sang number
  events.map(ev => ({ ...ev, status: ev.isActive ? 1 : 0 }))

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await eventService.deleteEvent(id)
      toast({ title: "Success", description: "Event deleted successfully" })
      fetchEvents()
    } catch (error: any) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to delete event", variant: "destructive" })
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
          <CardTitle>Events</CardTitle>
          <Button onClick={() => router.push(ROUTES.EVENT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1)
                setSearchTerm(e.target.value)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setPage(1)
              setSelectedStatus(val as "all" | "active" | "inactive")
            }}
          >
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={event.imagePath || "/placeholder.svg"}
                        alt={event.name || "Event image"}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div>
                      <div className="font-medium line-clamp-1">{event.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{event.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  {event.endDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      to {formatDate(event.endDate)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </TableCell>
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
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.EVENT_EDIT(event.id))}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {events.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
          <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
