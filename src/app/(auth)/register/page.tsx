import { RegisterForm } from "@/components/RegisterForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center bg-slate-50/50 px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="px-8 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">Terms</Link>
        </p>
      </div>
    </div>
  )
}