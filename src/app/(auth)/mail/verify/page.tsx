"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      setErrorMsg("Invalid or missing token.")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch("http://localhost:8080/graphql", {
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
          setErrorMsg(result.data?.verifyEmail?.message || "Verification failed.")
        }
      } catch (e) {
        setStatus('error')
        setErrorMsg("Connection error.")
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h1 className="text-xl font-medium">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">Your account is now active. You can proceed to sign in.</p>
            <Button onClick={() => router.push("/login")}>Go to Sign In</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-red-500 mb-6">{errorMsg}</p>
            <Button variant="outline" onClick={() => router.push("/register")}>Back to Registration</Button>
          </>
        )}
      </div>
    </div>
  )
}