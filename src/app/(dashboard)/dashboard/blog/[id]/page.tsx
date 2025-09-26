import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BlogPostForm } from "@/features/products/components/blog-post-form"

interface BlogPostDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const { id } = await params
  // TODO: Fetch blog post data based on params.id
  console.log('Blog post ID:', id) // Temporarily use id to avoid ESLint warning
  const mockBlogPostData = {
    title: "Top 10 Anime Figures of 2024",
    content: `Anime figures have become increasingly popular among collectors and fans alike. In this comprehensive guide, we'll explore the top 10 anime figures that have captured the hearts of enthusiasts in 2024.

From highly detailed statues to adorable nendoroids, this year has brought us some truly exceptional pieces that showcase the artistry and craftsmanship of figure manufacturers.

Whether you're a seasoned collector or just starting your journey into the world of anime figures, this list will help you discover some of the most sought-after pieces of the year.

Let's dive into our carefully curated selection of the best anime figures of 2024, featuring characters from popular series like Demon Slayer, Attack on Titan, and My Hero Academia.`,
    postCategoryId: "1", // Reviews
    publishDate: new Date("2024-01-15T10:30:00Z"),
    isPublished: true,
    featuredImagePath: "/anime-blog-post.jpg",
    tagIds: ["1", "2", "4"], // Anime, Figures, Reviews
  }

  return (
    <div>
      <Breadcrumb />
      <BlogPostForm initialData={mockBlogPostData} isEditing={true} />
    </div>
  )
}
