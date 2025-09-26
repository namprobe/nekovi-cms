import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { EventForm } from "@/features/marketing/components/event-form"

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  // TODO: Fetch event data by ID
  console.log('Event ID:', id) // Temporarily use id to avoid ESLint warning
  const mockEventData = {
    title: "Anime Expo 2024",
    description: "The biggest anime convention in North America",
    startDate: new Date("2024-07-04T09:00:00Z"),
    endDate: new Date("2024-07-07T18:00:00Z"),
    location: "Los Angeles Convention Center",
    maxAttendees: 5000,
    ticketPrice: 75.0,
    isActive: true,
    featuredImagePath: "/anime-expo.jpg",
  }

  return (
    <div>
      <Breadcrumb />
      <EventForm initialData={mockEventData} isEditing={true} />
    </div>
  )
}
