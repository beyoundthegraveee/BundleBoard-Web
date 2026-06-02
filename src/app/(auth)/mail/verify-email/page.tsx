"use client"

import { MailCheck, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

const RESEND_VERIFICATION_MUTATION = `
  mutation ResendVerification($email: String!) {
    resendVerificationEmail(email: $email) {
       success
       message
    }
  }
`;

export default function VerifyRequestPage() {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const handleResendEmail = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Email address is missing. Please try to register again." })
      return
    }

    setIsResending(true)
    setMessage(null)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: RESEND_VERIFICATION_MUTATION,
          variables: { email: email }
        }),
      });

      const result = await response.json()

      if (result.errors){
        throw new Error(result.errors[0].message)
      }

      const data = result.data?.resendVerificationEmail

      if (data?.success) {
        setMessage({ type: 'success', text: data.message || "Verification email resent successfully. Please check your inbox." })
      } else {
        setMessage({ type: 'error', text: data?.message || "Failed to resend email. Please try again later." })
      }
    } catch (e) {
      setMessage({ type: 'error', text: "Failed to resend email. Please try again later." })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-12 font-sans text-foreground relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <Card className="w-full max-w-md border border-border/60 rounded-none shadow-2xl text-center bg-card relative z-10 overflow-hidden">
        
        <CardHeader className="space-y-2 text-center border-b border-border/40 bg-muted/20 p-6">
          <div className="flex justify-center mb-1">
            <div className="border border-border/60 bg-background p-2.5 text-foreground">
              <MailCheck className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold uppercase tracking-wider text-foreground">Check your email</CardTitle>
          <CardDescription className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground/80">
            Verification link sent
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 p-8 text-left">
          {message && (
            <div className={`border p-3.5 rounded-none text-xs font-semibold uppercase tracking-wide ${
              message.type === 'success' 
                ? 'border-border/60 bg-muted/40 text-foreground' 
                : 'border-destructive/20 bg-destructive/5 text-destructive'
            }`}>
              {message.text}
            </div>
          )}
          
          <p className="text-xs font-normal leading-relaxed text-muted-foreground">
            We have transmitted an activation key to your destination address. 
            Confirm the connection via your inbox to initialize the account identity.
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-destructive">
            * Check your spam directory if the delivery is delayed.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-8 pt-0">
          <Button 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold uppercase text-xs tracking-widest py-6 transition-opacity shadow-sm" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
            ) : (
              "Resend verification email"
            )}
          </Button>
          <Button 
            variant="outline" 
            asChild 
            className="w-full border border-border/80 text-foreground bg-background hover:bg-accent rounded-none font-semibold uppercase text-xs tracking-widest py-6 transition-colors"
          >
            <Link href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8]" /> Return to sign in
            </Link>
          </Button>
        </CardFooter>

      </Card>
    </div>
  )
}