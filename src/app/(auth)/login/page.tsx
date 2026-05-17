import { LoginForm } from "../../../components/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 font-mono">
      <div className="w-full max-w-md space-y-6">
        
        <LoginForm />
        
        <p className="px-8 text-center text-xs font-black uppercase tracking-tight text-black">
          New_to_BundleBoard?{" "}
          <Link 
            href="/register" 
            className="text-red-600 underline underline-offset-4 decoration-2 hover:text-black transition-colors"
          >
            Create_an_account
          </Link>
        </p>
      </div>
    </div>
  )
}