"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg("INVALID_OR_MISSING_TOKEN")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: VERIFY_EMAIL_MUTATION,
            variables: { token }
          })
        })
        const result = await res.json()
        
        if (result.data?.verifyEmail?.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMsg(result.data?.verifyEmail?.message?.toUpperCase() || "VERIFICATION_PROTOCOL_FAILED")
        }
      } catch (e) {
        setStatus('error')
        setErrorMsg("CONNECTION_TERMINATED")
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-mono">
      <Card className="w-full max-w-md border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center bg-white">
        
        {status === 'loading' && (
          <>
            <CardHeader className="space-y-1 text-center border-b-4 border-black bg-zinc-50 p-6">
              <div className="flex justify-center mb-2">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Verifying_Node...</CardTitle>
              <CardDescription className="font-bold uppercase text-[10px] opacity-70">
                Executing_Cryptographic_Check
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-xs font-bold uppercase text-zinc-700 animate-pulse">
                Please hold. Synchronizing authorization token with core system infrastructure...
              </p>
            </CardContent>
          </>
        )}
        {status === 'success' && (
          <>
            <CardHeader className="space-y-1 text-center border-b-4 border-black bg-emerald-50 p-6">
              <div className="flex justify-center mb-2">
                <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_rgba(16,185,129,1)]">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 stroke-[3]" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black uppercase tracking-tighter text-emerald-900">Verified_Ok</CardTitle>
              <CardDescription className="font-bold uppercase text-[10px] text-emerald-700 opacity-80">
                Identity_Activation_Complete
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-8">
              <p className="text-xs font-bold uppercase text-left leading-relaxed text-zinc-700">
                Your cryptographic signature has been validated. The node is now declared active inside the BundleBoard network.
              </p>
              <Button 
                className="w-full bg-black text-white rounded-none font-black uppercase text-xs shadow-[6px_6px_0px_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all py-6" 
                onClick={() => router.push("/login")}
              >
                Initiate_Sign_In
              </Button>
            </CardContent>
          </>
        )}
        {status === 'error' && (
          <>
            <CardHeader className="space-y-1 text-center border-b-4 border-black bg-red-50 p-6">
              <div className="flex justify-center mb-2">
                <div className="border-4 border-red-600 bg-white p-3 shadow-[4px_4px_0px_rgba(220,38,38,1)]">
                  <XCircle className="h-8 w-8 text-red-600 stroke-[3]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter text-red-900">Protocol_Error</CardTitle>
              <CardDescription className="font-bold uppercase text-[10px] text-red-700 opacity-80">
                Verification_Failed
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-8">
              <div className="border-2 border-red-600 bg-red-50/50 p-3 text-left">
                <p className="text-[10px] font-black uppercase text-red-600 italic">
                  Cause: {errorMsg}
                </p>
              </div>
              <p className="text-xs font-bold uppercase text-left leading-relaxed text-zinc-700">
                The token is either deformed, expired, or has already been consumed by another initialization process.
              </p>
              <Button 
                variant="outline"
                className="w-full border-2 border-black rounded-none font-black uppercase text-xs shadow-[4px_4px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all py-6" 
                onClick={() => router.push("/register")}
              >
                Restart_Registration
              </Button>
            </CardContent>
          </>
        )}

      </Card>
    </div>
  )
}