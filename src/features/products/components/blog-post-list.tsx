// src/features/blog-post/components/blog-post-list.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { AsyncSelect, Option } from "@/shared/ui/selects/async-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { blogPostService } from "@/entities/blog-post/blog-post.service"
import { usePostCategoryOptions } from "@/entities/post-category/hooks/usePostCategoryOptions"
import type { BlogPostListItem, BlogPostFilter } from "@/entities/blog-post/types/blog-post"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

const PUBLISH_STATUS_OPTIONS = [
  { value: "all", label: "All Posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

const PAGE_SIZE = 10

export function BlogPostList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Đọc từ URL
  const initialPage = Number(searchParams.get("page")) || 1
  const initialSearch = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || ""
  const initialStatus = searchParams.get("status") || "all"

  // State UI
  const [page, setPage] = useState(initialPage)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory)
  const [selectedPublishStatus, setSelectedPublishStatus] = useState(initialStatus)

  // Debounce search
  const debouncedSearch = useDebounce(searchTerm, 400)

  // Data
  const [posts, setPosts] = useState<BlogPostListItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)



  const searchInputRef = useRef<HTMLInputElement>(null)
  const fetchCategoryOptions = usePostCategoryOptions()

  // Cập nhật URL
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
    if (selectedCategoryId) params.set("category", selectedCategoryId)
    if (selectedPublishStatus !== "all") params.set("status", selectedPublishStatus)

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`)
  }, [page, debouncedSearch, selectedCategoryId, selectedPublishStatus, pathname, router])

  // Khi bất kỳ filter nào thay đổi → reset page = 1 và update URL
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedCategoryId, selectedPublishStatus])

  useEffect(() => {
    updateUrl()
  }, [updateUrl])

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true)

    const filter: BlogPostFilter = {
      search: debouncedSearch || undefined,
      postCategoryId: selectedCategoryId || undefined,
      isPublished:
        selectedPublishStatus === "all"
          ? undefined
          : selectedPublishStatus === "published",
      page,
      pageSize: PAGE_SIZE,
      sortBy: "publishdate",
      sortOrder: "desc",
    }

    try {
      const result = await blogPostService.getBlogPosts(filter)
      if (result.isSuccess) {
        setPosts(result.items ?? [])
        setTotalItems(result.totalItems ?? 0)
      } else {
        toast.error(result.errors?.[0] || "Không tải được danh sách bài viết")
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi mạng")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, selectedCategoryId, selectedPublishStatus])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Focus input sau khi load
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

  const totalPages = Math.ceil(totalItems / PAGE_SIZE)

  // Category options với "All"
  const fetchOptionsWithAll = async (search: string): Promise<Option[]> => {
    const options = await fetchCategoryOptions(search)
    const allOption: Option = { id: "all", label: "All Categories" }
    const filtered = options.filter(o => o.id !== "all")
    return [allOption, ...filtered]
  }

  const handleTogglePublish = async (postId: string, current: boolean) => {
    if (publishingId === postId) return
    setPublishingId(postId)

    try {
      const result = await blogPostService.publishBlogPost(postId, !current)
      if (result.isSuccess) {
        toast.success(!current ? "Đã đăng bài" : "Đã hủy đăng")
        fetchPosts()
      } else {
        toast.error(result.message || "Cập nhật thất bại")
      }
    } catch {
      toast.error("Lỗi mạng")
    } finally {
      setPublishingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const result = await blogPostService.deleteBlogPost(id)
      if (result.isSuccess) {
        toast.success("Xóa bài viết thành công")
        fetchPosts()
      } else {
        toast.error(result.errors?.[0] || "Xóa thất bại")
      }
    } catch {
      toast.error("Lỗi mạng")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getStatusBadge = (status: number) => {
    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || "neutral"
    return <Badge variant={variant}>{status === 1 ? "Active" : "Inactive"}</Badge>
  }

  const getPublishBadge = (isPublished: boolean) => (
    isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="warning">Draft</Badge>
  )

  const formatDate = (date: string | Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date))

  // Loading UI
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Blog Posts</CardTitle>
          <Button onClick={() => router.push(ROUTES.BLOG_POST_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category */}
          <div className="w-full sm:w-64">
            <AsyncSelect
              value={selectedCategoryId || "all"}
              onChange={(val) => setSelectedCategoryId(val === "all" ? "" : val)}
              fetchOptions={fetchOptionsWithAll}
              placeholder="Category"
            />
          </div>

          {/* Publish status */}
          <select
            value={selectedPublishStatus}
            onChange={(e) => setSelectedPublishStatus(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm"
          >
            {PUBLISH_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium line-clamp-2">{post.title}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{post.authorName || "-"}</TableCell>

                <TableCell>
                  {post.postCategory?.name ? (
                    <Badge variant="outline">{post.postCategory.name}</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-gray-600">
                  {formatDate(post.publishDate)}
                </TableCell>

                <TableCell>{getStatusBadge(post.status)}</TableCell>

                <TableCell>{getPublishBadge(post.isPublished)}</TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(ROUTES.BLOG_POST_DETAIL(post.id))}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push(ROUTES.BLOG_POST_EDIT(post.id))}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(post.id, post.isPublished)}
                        disabled={publishingId === post.id}
                      >
                        {publishingId === post.id ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        {post.isPublished ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(post.id)}
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

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No blog posts found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems} posts
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc muốn xóa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}