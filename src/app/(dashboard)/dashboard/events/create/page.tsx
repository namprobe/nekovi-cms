//src/app/%28dashboard%29/dashboard/events/create/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { EventForm } from "@/features/marketing/components/event-form"

export default function CreateEventPage() {
  return (
    <div>
      <Breadcrumb />
      <EventForm />
    </div>
  )
}
