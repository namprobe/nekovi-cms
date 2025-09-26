import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mb-3">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 3v1h6V3H9zm2 4v8m4-8v8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Anime CMS</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Content Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
