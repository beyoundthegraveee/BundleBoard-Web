import { RegisterForm } from "@/components/RegisterForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 font-mono">
      <div className="w-full max-w-md space-y-6">
        
        <RegisterForm />
        
        <p className="px-8 text-center text-xs font-black uppercase tracking-tight text-black">
          Already_have_an_account?{" "}
          <Link 
            href="/login" 
            className="text-red-600 underline underline-offset-4 decoration-2 hover:text-black transition-colors"
          >
            Sign_in
          </Link>
        </p>

        <p className="px-8 text-center text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline text-black hover:text-red-600 transition-colors">Terms_of_Service</Link>
        </p>
      </div>
    </div>
  )
}