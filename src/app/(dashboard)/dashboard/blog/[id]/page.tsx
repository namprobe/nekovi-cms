// src/app/(dashboard)/dashboard/blog/view/[id]/page.tsx

"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BlogPostView } from "@/features/products/components/blog-post-view"

interface BlogPostViewPageProps {
  params: Promise<{ id: string }>
}

export default function BlogPostViewPage({ params }: BlogPostViewPageProps) {
  const { id } = use(params)

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <BlogPostView postId={id} />
    </div>
  )
}