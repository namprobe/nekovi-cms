// src/app/(dashboard)/dashboard/blog/[id]/edit/page.tsx

"use client"
import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BlogPostForm } from "@/features/products/components/blog-post-form"
import { useBlogPostDetail } from "@/features/blog-post/hooks/use-blog-post-detail"
import type { CreateBlogPostDto } from "@/entities/blog-post/types/blog-post"

interface BlogPostEditPageProps {
  params: Promise<{ id: string }>
}

export default function BlogPostEditPage({ params }: BlogPostEditPageProps) {
  const { id } = use(params)
  const { item: blogPost, loading, error } = useBlogPostDetail(id)

  if (loading) return <div className="p-6">Loading...</div>
  if (error || !blogPost) return <div className="p-6 text-red-500">Error: {error || "Blog post not found"}</div>

  const initialData: Partial<CreateBlogPostDto> & {
    id?: string
    featuredImage?: string
    tagIds?: string[]
  } = {
    id: blogPost.id,
    title: blogPost.title,
    content: blogPost.content,
    postCategoryId: blogPost.postCategory?.id || "",
    publishDate: new Date(blogPost.publishDate),
    isPublished: blogPost.isPublished,
    featuredImage: blogPost.featuredImage,
    tagIds: blogPost.postTags.map(pt => pt.tagId),
  }

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
        <p className="text-muted-foreground">Update your blog post content and settings.</p>
        <BlogPostForm initialData={initialData} isEditing={true} />
      </div>
    </div>
  )
}