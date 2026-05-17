"use client"

import { MailCheck, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-mono">
      <Card className="w-full max-w-md border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center bg-white">
        
        <CardHeader className="space-y-1 text-center border-b-4 border-black bg-zinc-50 p-6">
          <div className="flex justify-center mb-2">
            <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <MailCheck className="h-8 w-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Check_Email</CardTitle>
          <CardDescription className="font-bold uppercase text-[10px] opacity-70">
            Verification_Link_Dispatched
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 p-8 text-left">
          {message && (
            <Alert className={`border-2 rounded-none ${message.type === 'success' ? 'border-black bg-zinc-50' : 'border-red-600 bg-red-50'}`}>
              <AlertDescription className={`font-bold uppercase text-[10px] ${message.type === 'success' ? 'text-black' : 'text-red-600'}`}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs font-bold uppercase leading-relaxed text-zinc-700">
            We have transmitted an activation key to your node destination. 
            Confirm the connection via your inbox to initialize the identity.
          </p>
          <p className="text-[10px] italic font-black uppercase text-red-600">
            * Check spam directory if protocol is delayed.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-8 pt-0">
          <Button 
            variant="outline" 
            className="w-full border-2 border-black rounded-none font-black uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all py-5" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Resend_Verification_Email"
            )}
          </Button>

          <Button 
            variant="ghost" 
            asChild 
            className="w-full rounded-none font-black uppercase text-xs hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all py-5"
          >
            <Link href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4 stroke-[3]" /> Return_to_Sign_In
            </Link>
          </Button>
        </CardFooter>

      </Card>
    </div>
  )
}