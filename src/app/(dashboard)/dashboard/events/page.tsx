//src/app/%28dashboard%29/dashboard/events/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { EventList } from "@/features/marketing/components/event-list"

export default function EventsPage() {
  return (
    <div>
      <Breadcrumb />
      <EventList />
    </div>
  )
}
