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
      toast.error("Connection failure." + errorMessage)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <div className="flex justify-center mb-4">
           <div className="p-3 border border-border/60 bg-background text-foreground">
             <MailCheck className="h-6 w-6 stroke-[1.5]" />
           </div>
        </div>
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
          Check your email
        </CardTitle>
        <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
          Verification Link Dispatched
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-6 p-8">
        <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
          We have transmitted an activation key to:{" "}
          <span className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 select-all">
            {email || "payload@address.missing"}
          </span>.
        </p>

        <div className="border border-destructive/20 bg-destructive/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-destructive/80 text-center">
            Check your spam folder if delivery is delayed.
          </p>
        </div>

        <div className="grid gap-3">
          <Button 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend Verification"}
          </Button>

          <Button 
            variant="outline" 
            asChild 
            className="w-full border border-border/60 rounded-none font-semibold uppercase text-[11px] tracking-widest py-6 hover:bg-accent"
          >
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to sign in
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}