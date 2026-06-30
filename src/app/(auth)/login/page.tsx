import { LoginForm } from "@/components/auth/login/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background px-4 py-12 font-sans relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        <LoginForm />
        
        <p className="px-8 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          New to the platform?
          <Link 
            href="/register" 
            className="text-primary font-semibold border-b border-primary/30 hover:border-primary transition-colors pb-0.5 ml-1.5"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}