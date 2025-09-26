import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BlogPostList } from "@/features/products/components/blog-post-list"

export default function BlogPostsPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground">Create and manage your blog content to engage with your audience.</p>
        </div>

        <BlogPostList />
      </div>
    </div>
  )
}
