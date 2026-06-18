"use client"

import React from 'react'
import { MailCheck, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client/react"
import { ResendVerificationDocument } from "@/graphql/generated"
import { BackgroundGradient } from "@/components/BackgroundGradient"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [executeResend, { loading: isResending }] = useMutation(ResendVerificationDocument)

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address is missing. Please try to register again.")
      return
    }

    try {
      const { data } = await executeResend({
        variables: { email: email }
      });

      const resultData = data?.resendVerificationEmail

      if (resultData?.success) {
        toast.success(resultData.message || "Verification email resent successfully. Please check your inbox.")
      } else {
        toast.error(resultData?.message || "Failed to resend email. Please try again later.")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to resend email. Please try again later.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 text-foreground relative overflow-hidden">
      <BackgroundGradient />

      <div className="w-full max-w-xl border border-border/40 bg-background/60 backdrop-blur-xl rounded-none shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4 text-center border-b border-border/40 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-primary/10 text-primary font-mono text-[9px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border-b border-r border-primary/20">
            Mail Pipeline // Active
          </div>

          <div className="flex justify-center pt-4">
            <div className="border border-border/60 bg-background p-4 text-foreground relative group">
              <MailCheck className="h-6 w-6 stroke-[1.5]" />
              <div className="absolute inset-0 bg-primary/5 blur-sm -z-10" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground font-display">
            Check your email
          </h1>
          <p className="font-mono font-semibold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">
            Verification Link Dispatched
          </p>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          <p className="font-sans text-sm leading-relaxed text-muted-foreground opacity-90 text-center md:text-left">
            We have transmitted an activation key to your destination address:{" "}
            <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 text-xs select-all">
              {email || "payload@address.missing"}
            </span>. 
            Confirm the connection via your inbox to initialize the account identity.
          </p>
          
          <div className="border-l-2 border-destructive/50 pl-4 py-1 bg-destructive/[0.02]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-destructive/90 leading-normal">
              Notice // Check your spam directory if the delivery is delayed.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10 pt-0 flex flex-col gap-4">
          <Button 
            className={cn(
              "w-full h-14 rounded-none font-display font-bold uppercase text-xs tracking-[0.2em] transition-all duration-300 relative overflow-hidden",
              isResending 
                ? "bg-muted text-muted-foreground/40 cursor-not-allowed" 
                : "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            )}
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <div className="flex items-center gap-3 font-mono text-xs">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Re-transmitting Pipeline...</span>
              </div>
            ) : (
              "Resend verification email"
            )}
          </Button>

          <Button 
            variant="outline" 
            asChild 
            className="w-full h-14 border border-border/80 text-foreground bg-background/50 hover:bg-accent hover:border-foreground rounded-none font-display font-semibold uppercase text-xs tracking-[0.15em] transition-all duration-300"
          >
            <Link href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4 stroke-[1.8]" /> Return to sign in
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}