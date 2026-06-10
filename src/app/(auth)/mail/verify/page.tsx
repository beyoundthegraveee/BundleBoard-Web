"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from "@apollo/client/react"
import { VerifyEmailDocument } from "@/graphql/generated"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState("")
  const hasVerified = useRef(false)
  const [executeVerify] = useMutation(VerifyEmailDocument)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg("Invalid or missing verification token")
      return
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const { data } = await executeVerify({
          variables: { token }
        })

        if (data?.verifyEmail?.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMsg(data?.verifyEmail?.message || "Verification process failed")
        }
      } catch (e: any) {
        setStatus('error')
        setErrorMsg(e.message || "Secure connection terminated")
      }
    }

    verify()
  }, [token, executeVerify])

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-12 font-sans text-foreground relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <Card className="w-full max-w-md border border-border/60 rounded-none shadow-2xl bg-card text-center relative z-10 overflow-hidden">
        {status === 'loading' && (
          <>
            <CardHeader className="space-y-2 text-center border-b border-border/40 bg-muted/20 p-6">
              <div className="flex justify-center mb-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary stroke-[1.5]" />
              </div>
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-foreground">Verifying email...</CardTitle>
              <CardDescription className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground/80">
                Executing Cryptographic Check
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-xs font-normal leading-relaxed text-muted-foreground animate-pulse">
                Please hold. Synchronizing secure authorization token with the platform infrastructure...
              </p>
            </CardContent>
          </>
        )}
        {status === 'success' && (
          <>
            <CardHeader className="space-y-2 text-center border-b border-border/40 bg-emerald-50/5 dark:bg-emerald-950/10 p-6">
              <div className="flex justify-center mb-1">
                <div className="border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-foreground">Email Verified</CardTitle>
              <CardDescription className="font-semibold uppercase text-[10px] text-emerald-500 tracking-widest">
                Account Activation Complete
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-8">
              <p className="text-xs font-normal text-muted-foreground leading-relaxed text-left">
                Your verification token has been successfully validated. Your account is now active and ready inside the BundleBoard network.
              </p>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold uppercase text-xs tracking-widest py-6 transition-opacity shadow-sm" 
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            </CardContent>
          </>
        )}

        {status === 'error' && (
          <>
            <CardHeader className="space-y-2 text-center border-b border-border/40 bg-destructive/5 p-6">
              <div className="flex justify-center mb-1">
                <div className="border border-destructive/30 bg-destructive/5 p-2.5 text-destructive">
                  <XCircle className="h-6 w-6 stroke-[1.5]" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-foreground">Verification Error</CardTitle>
              <CardDescription className="font-semibold uppercase text-[10px] text-destructive tracking-widest">
                Process Failed
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-8">
              <div className="border border-destructive/20 bg-destructive/5 p-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                  Cause: {errorMsg}
                </p>
              </div>
              <p className="text-xs font-normal text-muted-foreground leading-relaxed text-left">
                The token is either deformed, expired, or has already been consumed by another initialization query.
              </p>
              <Button 
                variant="outline"
                className="w-full border border-border/80 text-foreground bg-background hover:bg-accent rounded-none font-semibold uppercase text-xs tracking-widest py-6 transition-colors" 
                onClick={() => router.push("/register")}
              >
                Restart Registration
              </Button>
            </CardContent>
          </>
        )}

      </Card>
    </div>
  )
}