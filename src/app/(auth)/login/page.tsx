import { LoginForm } from "@/components/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center bg-slate-50/50 px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <LoginForm />

        <p className="px-8 text-center text-sm text-muted-foreground">
          New to BundleBoard?{" "}
          <Link 
            href="/register" 
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}