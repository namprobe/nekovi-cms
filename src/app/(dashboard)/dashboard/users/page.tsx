import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import UserList from "@/features/user/components/user-list"

export default function UsersPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions.</p>
        </div>

        <UserList />
      </div>
    </div>
  )
}
