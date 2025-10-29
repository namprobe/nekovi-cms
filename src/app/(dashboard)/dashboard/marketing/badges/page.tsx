import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { BadgeList } from "@/features/marketing/components/badge-list"

export default function BadgesPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Badges</h1>
          <p className="text-muted-foreground">
            Manage achievement badges and their discount rewards.
          </p>
        </div>

        <BadgeList />
      </div>
    </div>
  )
}