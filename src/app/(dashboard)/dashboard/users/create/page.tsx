import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { UserForm } from "@/features/auth/components/user-form"

export default function CreateUserPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system.</p>
        </div>

        <UserForm />
      </div>
    </div>
  )
}
