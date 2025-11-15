//src/app/%28dashboard%29/dashboard/blog/create/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BlogPostForm } from "@/features/products/components/blog-post-form"

export default function CreateBlogPostPage() {
  return (
    <div>
      <Breadcrumb />
      <BlogPostForm />
    </div>
  )
}
