import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { UserForm } from "@/features/auth/components/user-form"

interface UserDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  // TODO: Fetch user data based on params.id
  const mockUserData = {
    firstName: "John",
    lastName: "Doe",
    userName: "johndoe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    roleIds: ["2"], // Admin role
  }

  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
          <p className="text-muted-foreground">Update user information and permissions.</p>
        </div>

        <UserForm initialData={mockUserData} isEditing={true} />
      </div>
    </div>
  )
}
