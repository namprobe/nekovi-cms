// src/features/blog-post/components/blog-post-list.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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

const publishStatusOptions = [
  { value: "all", label: "All Posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

export function BlogPostList() {
  const router = useRouter()

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPublishStatus, setSelectedPublishStatus] = useState("all")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  // DATA STATES
  const [allPosts, setAllPosts] = useState<BlogPostListItem[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // PAGINATION
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // DELETE STATE
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [publishingId, setPublishingId] = useState<string | null>(null)
  // Category hook
  const fetchCategoryOptions = usePostCategoryOptions()

  const fetchOptionsWithAll = useCallback(
    async (search: string): Promise<Option[]> => {
      const options = await fetchCategoryOptions(search)
      return options
    },
    [fetchCategoryOptions]
  )

  // FETCH POSTS
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const filter: BlogPostFilter = {
      isPublished:
        selectedPublishStatus === "all"
          ? undefined
          : selectedPublishStatus === "published",
      postCategoryId: selectedCategoryId === "" ? undefined : selectedCategoryId,
      page,
      pageSize,
      sortBy: "publishdate",
      sortOrder: "desc",
    }

    try {
      const result = await blogPostService.getBlogPosts(filter)
      if (result.isSuccess) {
        setAllPosts(result.items)
        setFilteredPosts(result.items)
        setTotalPages(result.totalPages)
        if (page === 1) applyFilters(result.items)
      } else {
        setError(result.errors?.[0] || "Failed to load posts")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [selectedPublishStatus, selectedCategoryId, page, pageSize])

  // CLIENT-SIDE FILTERING
  const applyFilters = useCallback(
    (posts: BlogPostListItem[]) => {
      let filtered = [...posts]

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(term) ||
            (post.authorName && post.authorName.toLowerCase().includes(term)) ||
            (post.postCategory?.name &&
              post.postCategory.name.toLowerCase().includes(term))
        )
      }

      if (selectedPublishStatus !== "all") {
        const isPublished = selectedPublishStatus === "published"
        filtered = filtered.filter((post) => post.isPublished === isPublished)
      }

      setFilteredPosts(filtered)
    },
    [searchTerm, selectedPublishStatus]
  )

  // EFFECTS
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    applyFilters(allPosts)
  }, [searchTerm, selectedPublishStatus, allPosts, applyFilters])

  useEffect(() => {
    setPage(1)
  }, [selectedPublishStatus, selectedCategoryId])

  // UI HELPERS
  const getStatusBadge = (status: number) => {
    const variant =
      STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || "neutral"
    const statusText = status === 1 ? "Active" : "Inactive"
    return <Badge variant={variant}>{statusText}</Badge>
  }

  const getPublishBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="success">Published</Badge>
    ) : (
      <Badge variant="warning">Draft</Badge>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  // HANDLE TOGGLE PUBLISH
  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    if (publishingId === postId) return // Prevent double click

    setPublishingId(postId)
    const newStatus = !currentStatus

    try {
      const result = await blogPostService.publishBlogPost(postId, newStatus)
      if (result.isSuccess) {
        toast.success(newStatus ? "Đã đăng bài" : "Đã hủy đăng")
        fetchPosts() // refresh
      } else {
        toast.error(result.message || "Cập nhật thất bại")
      }
    } catch (err) {
      console.error("Publish error:", err)
      toast.error("Lỗi mạng")
    } finally {
      setPublishingId(null) // Luôn reset
    }
  }

  // HANDLE DELETE
  const handleDeletePost = async (id: string) => {
    setIsDeleting(true)
    try {
      const result = await blogPostService.deleteBlogPost(id)
      if (result.isSuccess) {
        toast.success("Xóa bài viết thành công!")
        setAllPosts((prev) => prev.filter((p) => p.id !== id))
        setFilteredPosts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error(result.errors?.[0] || "Xóa thất bại")
      }
    } catch (err) {
      toast.error("Lỗi mạng")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  // LOADING UI
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500 text-center">{error}</p>
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

        {/* SEARCH + FILTERS */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-48">
            <AsyncSelect
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              fetchOptions={fetchOptionsWithAll}
              placeholder="Category"
            />
          </div>

          <select
            value={selectedPublishStatus}
            onChange={(e) => setSelectedPublishStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm w-40"
          >
            {publishStatusOptions.map((opt) => (
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
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
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {publishingId === post.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Eye className="mr-2 h-4 w-4" />
                          )}
                          <span>
                            {publishingId === post.id
                              ? "Đang xử lý..."
                              : post.isPublished
                                ? "Unpublish"
                                : "Publish"}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(post.id)
                        }}
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

        {/* EMPTY STATE */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts found</p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài viết này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeletePost(deleteId)}
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