"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  RequestPasswordResetDocument,
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
} from "@/graphql/generated"

interface ForgotFormData {
  email: string;
}

export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ForgotFormData>({
    defaultValues: { email: "" }
  })

  const userEmail = watch("email")

  const [requestReset, { loading: isLoading }] = useMutation<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >(RequestPasswordResetDocument)

  const onSubmit = async (data: ForgotFormData) => {
    setServerError(null)
    try {
      const response = await requestReset({
        variables: {
          input: { email: data.email }
        }
      })

      const result = response.data?.requestPasswordReset
      
      if (result?.success) {
        setIsSent(true)
      } else {
        setServerError(result?.message || "Something went wrong.")
      }
    } catch (error: any) {
      setServerError(error.message || "An unexpected error occurred.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
          Stage 01: Identity Verification
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 p-8">
        {serverError && (
          <Alert className="border border-destructive/30 rounded-none bg-destructive/5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <AlertDescription className="text-destructive font-semibold uppercase text-[11px] tracking-wider">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
                placeholder="Enter your email"
                disabled={isLoading}
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button 
              className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="grid gap-4 text-center py-4">
            <Alert className="border border-primary/30 rounded-none bg-primary/5 flex flex-col items-center justify-center p-6 text-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <AlertDescription className="text-primary font-bold uppercase text-[12px] tracking-wider max-w-xs">
                Reset Link Sent To Email
              </AlertDescription>
            </Alert>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              We have dispatched a recovery secure-key link to <span className="text-foreground font-semibold">{userEmail}</span>. Please check your inbox.
            </p>
          </div>
        )}

        <div className="border-t border-border/30 pt-4 text-center">
          <Link href="/login" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}