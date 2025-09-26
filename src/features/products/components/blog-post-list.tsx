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
import type { BlogPostListItem } from "@/shared/types/blog"
import { STATUS_VARIANTS } from "@/core/config/constants"
import { ROUTES } from "@/core/config/routes"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react"

// Mock data - replace with actual API call
const mockBlogPosts: BlogPostListItem[] = [
  {
    id: "1",
    title: "Top 10 Anime Figures of 2024",
    authorName: "John Doe",
    categoryName: "Reviews",
    publishDate: new Date("2024-01-15T10:30:00Z"),
    isPublished: true,
    featuredImagePath: "/anime-blog-post.jpg",
    status: 1,
  },
  {
    id: "2",
    title: "How to Care for Your Anime Collectibles",
    authorName: "Jane Smith",
    categoryName: "Guides",
    publishDate: new Date("2024-01-14T15:45:00Z"),
    isPublished: true,
    featuredImagePath: "/anime-care-guide.jpg",
    status: 1,
  },
  {
    id: "3",
    title: "Upcoming Anime Releases This Season",
    authorName: "Bob Johnson",
    categoryName: "News",
    publishDate: new Date("2024-01-13T09:15:00Z"),
    isPublished: false,
    featuredImagePath: "/anime-releases.jpg",
    status: 1,
  },
  {
    id: "4",
    title: "Best Anime Conventions to Visit",
    authorName: "Alice Brown",
    categoryName: "Events",
    publishDate: new Date("2024-01-12T14:20:00Z"),
    isPublished: true,
    featuredImagePath: "/anime-convention.jpg",
    status: 0,
  },
]

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPublishStatus, setSelectedPublishStatus] = useState("all")
  const [filteredPosts, setFilteredPosts] = useState<BlogPostListItem[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockBlogPosts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.categoryName && post.categoryName.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => post.categoryName && post.categoryName.toLowerCase() === selectedCategory.toLowerCase(),
      )
    }

    if (selectedPublishStatus !== "all") {
      const isPublished = selectedPublishStatus === "published"
      filtered = filtered.filter((post) => post.isPublished === isPublished)
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, selectedCategory, selectedPublishStatus])

  const getStatusBadge = (status: number) => {
    const statusText = status === 1 ? "Active" : status === 0 ? "Inactive" : "Pending"
    return <Badge variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}>{statusText}</Badge>
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
    // TODO: Implement API call to toggle publish status
    console.log("Toggling publish status:", postId, !currentStatus)

    // Update local state for demo
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, isPublished: !currentStatus } : post)))
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
          <CardTitle>Blog Posts</CardTitle>
          <Button onClick={() => router.push(ROUTES.BLOG_POST_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPublishStatus} onValueChange={setSelectedPublishStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {publishStatusOptions.map((option) => (
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
                      <Image
                        src={post.featuredImagePath || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-2">{post.title}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{post.authorName}</TableCell>
                <TableCell>
                  {post.categoryName ? (
                    <Badge variant="outline">{post.categoryName}</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(post.publishDate)}</TableCell>
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
