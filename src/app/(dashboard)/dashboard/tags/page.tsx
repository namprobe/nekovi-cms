import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { TagList } from "@/features/tags/components/tag-list"

export default function TagsPage() {
    return (
        <div>
            <Breadcrumb />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tags</h1>
                    <p className="text-muted-foreground">Manage product and post tags for better organization and filtering.</p>
                </div>
                <TagList />
            </div>
        </div>
    )
}