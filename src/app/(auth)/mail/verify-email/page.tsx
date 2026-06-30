"use client"

import React from 'react'
import { MailCheck, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client/react"
import { ResendVerificationDocument } from "@/graphql/generated"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [executeResend, { loading: isResending }] = useMutation(ResendVerificationDocument)

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address is missing.")
      return
    }

    try {
      const { data } = await executeResend({ variables: { email: email } });
      if (data?.resendVerificationEmail?.success) {
        toast.success("Verification email resent successfully.")
      } else {
        toast.error(data?.resendVerificationEmail?.message || "Failed to resend.")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Connection failure. " + errorMessage)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 sm:p-8 font-sans text-foreground relative overflow-hidden bg-background">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center border-b border-border/40 pb-6 pt-8">
          <div className="flex justify-center mb-4">
             <div className="p-3.5 border border-border/60 bg-background text-primary shadow-sm">
               <MailCheck className="h-7 w-7 stroke-[1.5]" />
             </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-foreground">
            Check your email
          </CardTitle>
          <CardDescription className="font-medium uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground">
            Verification Link Dispatched
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 p-6 sm:p-8">
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground text-center">
            We have transmitted an activation key to: <br className="hidden sm:block" />
            <span className="inline-block mt-2 font-mono text-foreground font-medium bg-secondary/50 px-3 py-1.5 select-all border border-border/40">
              {email || "payload@address.missing"}
            </span>
          </p>

          <div className="border border-border/50 bg-muted/30 p-4 text-center">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-foreground/80">
              Didn not receive it? Please check your <span className="font-semibold text-foreground">spam</span> or <span className="font-semibold text-foreground">junk</span> folder.
            </p>
          </div>

          <div className="grid gap-3 pt-2">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] sm:text-xs tracking-widest rounded-none py-6 transition-opacity"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isResending ? "Resending..." : "Resend Verification"}
            </Button>

            <Button 
              variant="outline" 
              asChild 
              className="w-full border border-border/60 rounded-none font-semibold uppercase text-[11px] sm:text-xs tracking-widest py-6 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link href="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to sign in
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}