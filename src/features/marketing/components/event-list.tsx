// src/features/events/components/event-list.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, ShoppingBag } from "lucide-react"
import { eventService } from "@/entities/event/services/event"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { EventProductModal } from "@/features/events/components/event-product-modal"

const statusOptions = [
  { value: "all", label: "All Events" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function EventList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // 1. Lấy giá trị khởi tạo từ URL
  const initialPage = Number(searchParams.get("page")) || 1
  const initialSearch = searchParams.get("search") || ""
  const initialStatus = (searchParams.get("status") as "all" | "active" | "inactive") || "all"

  // 2. State setup
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)

  // Search state
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const debouncedSearch = useDebounce(searchTerm, 400) // Debounce 400ms

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">(initialStatus)

  // Pagination state
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  // Ref cho input search để focus lại
  const searchInputRef = useRef<HTMLInputElement>(null)

  // --- STATE CHO MODAL PRODUCT ---
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventName, setSelectedEventName] = useState<string>("")
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // 3. Effect: Đồng bộ state lên URL
  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (selectedStatus !== "all") params.set("status", selectedStatus)

    // Dùng replace để update URL mà không reload, scroll false để giữ vị trí
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [page, debouncedSearch, selectedStatus, pathname, router])

  // 4. Focus lại input sau khi loading xong (nếu có search)
  useEffect(() => {
    if (!loading && searchInputRef.current && searchTerm) {
      searchInputRef.current.focus()
    }
  }, [loading])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // Map status filter
      const statusParam = selectedStatus === "all" ? undefined : selectedStatus

      const response = await eventService.getEvents({
        page,
        pageSize: limit,
        search: debouncedSearch || undefined, // Dùng debouncedSearch thay vì searchTerm
        status: statusParam,
      })

      if (response.isSuccess && response.data) {
        setEvents(response.data.items)
        setTotal(response.data.totalItems)
      } else {
        setEvents([])
        setTotal(0)
        // Chỉ hiện toast lỗi nếu thực sự lỗi, không phải do không tìm thấy
        if (response.message) {
          toast({
            title: "Error",
            description: response.message || "Failed to load events",
            variant: "destructive",
          })
        }
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

  // 5. Fetch events khi page, debouncedSearch hoặc selectedStatus thay đổi
  useEffect(() => {
    fetchEvents()
  }, [page, debouncedSearch, selectedStatus])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
  }

  const openProductModal = (id: string, name: string) => {
    setSelectedEventId(id)
    setSelectedEventName(name)
    setIsProductModalOpen(true)
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

  if (loading && events.length === 0) {
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
    <>
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
                ref={searchInputRef}
                placeholder="Search events..."
                value={searchTerm}
                // 6. Reset page = 1 tại đây
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                // 6. Reset page = 1 tại đây
                setSelectedStatus(val as "all" | "active" | "inactive")
                setPage(1)
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
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-right"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {events.map((event) => {
                  // Xử lý status hiển thị
                  const displayStatus = typeof event.status === 'number' ? event.status : (event.isActive ? 1 : 0);

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img
                              src={event.imagePath || "/placeholder.svg"}
                              alt={event.name || "Event image"}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="min-w-[150px]">
                            <div className="font-medium line-clamp-1">{event.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm">
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        {event.endDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            to {formatDate(event.endDate)}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="line-clamp-1">{event.location}</span>
                      </TableCell>

                      <TableCell>{getStatusBadge(displayStatus)}</TableCell>

                      <TableCell className="text-right">
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

                            {/* --- MỤC QUẢN LÝ SẢN PHẨM --- */}
                            <DropdownMenuItem onClick={() => openProductModal(event.id, event.name)}>
                              <ShoppingBag className="mr-2 h-4 w-4" /> Manage Products
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events found
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>

              <span className="text-sm">
                Page {page} of {Math.ceil(total / limit) || 1}
              </span>

              <Button
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* --- RENDER MODAL PRODUCT --- */}
      {selectedEventId && (
        <EventProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          eventId={selectedEventId}
          eventTitle={selectedEventName}
        />
      )}
    </>
  )
}