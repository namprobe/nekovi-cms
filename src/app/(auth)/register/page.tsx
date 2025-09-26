import { RegisterForm } from "@/features/auth/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Anime CMS</h1>
          <p className="text-muted-foreground">Create your admin account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
