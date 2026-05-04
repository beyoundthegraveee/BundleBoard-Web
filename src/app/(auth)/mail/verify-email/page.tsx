"use client"

import { MailCheck, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyRequestPage() {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResendEmail = async () => {
    setIsResending(true)
    setMessage(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage({ type: 'success', text: "Verification link has been resent to your email." })
    } catch (e) {
      setMessage({ type: 'error', text: "Failed to resend email. Please try again later." })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MailCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. 
            Please click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or click the button below to resend.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Email
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}