// src/app/(dashboard)/dashboard/post-categories/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { PostCategoryList } from "@/features/post-category/components/post-category-list"

export default function PostCategoriesPage() {
    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div>
                <h1 className="text-3xl font-bold text-foreground">Post Categories</h1>
                <p className="text-muted-foreground">
                    Manage categories for your blog posts.
                </p>
            </div>

            <PostCategoryList />
        </div>
    )
}
