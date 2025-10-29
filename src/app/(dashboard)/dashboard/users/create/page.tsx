// src/app/(dashboard)/dashboard/users/create/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { UserForm } from "@/features/user/components/user-form"

export default function CreateUserPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Create User</h1>
        <p className="text-muted-foreground">Add a new user to the system.</p>
        <UserForm mode="create" />
      </div>
    </div>
  )
}
// import { UserForm } from "@/features/auth/components/user-form"

// export default function CreateUserPage() {
//   return (
//     <div>
//       <Breadcrumb />

//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Create User</h1>
//           <p className="text-muted-foreground">Add a new user to the system.</p>
//         </div>

//         <UserForm />
//       </div>
//     </div>
//   )
// }
