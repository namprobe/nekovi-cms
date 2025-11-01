// src/features/blog-post/components/blog-post-list.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { blogPostService } from "@/entities/blog-post/blog-post.service"
import type { BlogPostListItem, BlogPostFilter } from "@/entities/blog-post/types/blog-post"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "reviews", label: "Reviews" },
  { value: "guides", label: "Guides" },
  { value: "news", label: "News" },
  { value: "events", label: "Events" },
]

const publishStatusOptions = [
  { value: "all", label: "All Posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

export function BlogPostList() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPublishStatus, setSelectedPublishStatus] = useState("all")

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const filter: BlogPostFilter = {
      search: searchTerm || undefined,
      isPublished: selectedPublishStatus === "all" ? undefined : selectedPublishStatus === "published",
      page,
      pageSize,
      sortBy: "publishdate",
      sortOrder: "desc",
    }

    try {
      const result = await blogPostService.getBlogPosts(filter)
      if (result.isSuccess) {
        setPosts(result.items)
        setTotalPages(result.totalPages)
      } else {
        setError(result.errors?.[0] || "Failed to load posts")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedPublishStatus, page, pageSize])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const getStatusBadge = (status: number) => {
    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    // TODO: Implement toggle publish API
    console.log("Toggle publish:", postId, !currentStatus)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          // Thay thế phần loading
          {loading && (
            <Card>
              <CardContent className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPublishStatus} onValueChange={setSelectedPublishStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {publishStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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
                  {post.postCategoryName ? (
                    <Badge variant="outline">{post.postCategoryName}</Badge>
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
                      <DropdownMenuItem onClick={() => router.push(ROUTES.BLOG_POST_DETAIL(post.id))}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(ROUTES.BLOG_POST_DETAIL(post.id))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(post.id, post.isPublished)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {post.isPublished ? "Unpublish" : "Publish"}
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

        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts found</p>
          </div>
        )}

        {/* Pagination */}
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
    </Card>
  )
}