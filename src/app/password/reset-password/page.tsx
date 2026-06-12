"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { useSearchParams, useRouter } from "next/navigation"
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
  ConfirmPasswordResetDocument,
  ConfirmPasswordResetMutation,
  ConfirmPasswordResetMutationVariables
} from "@/graphql/generated"

interface ResetPasswordFormData {
  newPassword?: string;
  confirmPassword?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Автоматически забираем токен из URL query параметров (?token=...)
  const token = searchParams.get("token")

  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  })

  const newPassword = watch("newPassword")

  const [confirmReset, { loading: isLoading }] = useMutation<
    ConfirmPasswordResetMutation,
    ConfirmPasswordResetMutationVariables
  >(ConfirmPasswordResetDocument)

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null)
    setServerSuccess(null)

    if (!token) {
      setServerError("Reset token is missing or invalid. Please request a new link.")
      return
    }

    try {
      const response = await confirmReset({
        variables: {
          input: {
            token: token,
            newPassword: data.newPassword || "",
            confirmPassword: data.confirmPassword || ""
          }
        }
      })

      const result = response.data?.confirmPasswordReset

      if (result?.success) {
        setServerSuccess("Password changed successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setServerError(result?.message || "Invalid or expired recovery token.")
      }
    } catch (error: any) {
      setServerError(error.message || "An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
        <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
          <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
            Create New Password
          </CardTitle>
          <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
            Stage 02: Secure Key Override
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 p-8">
          {/* Если токена нет в URL вообще */}
          {!token && (
            <Alert className="border border-destructive/30 rounded-none bg-destructive/5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <AlertDescription className="text-destructive font-semibold uppercase text-[11px] tracking-wider">
                Secure token not found. Action denied.
              </AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert className="border border-destructive/30 rounded-none bg-destructive/5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <AlertDescription className="text-destructive font-semibold uppercase text-[11px] tracking-wider">
                {serverError}
              </AlertDescription>
            </Alert>
          )}

          {serverSuccess && (
            <Alert className="border border-primary/30 rounded-none bg-primary/5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <AlertDescription className="text-primary font-semibold uppercase text-[11px] tracking-wider">
                {serverSuccess}
              </AlertDescription>
            </Alert>
          )}

          {token && !serverSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="newPassword" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
                  placeholder="Enter new password"
                  disabled={isLoading}
                  {...register("newPassword", { 
                    required: "New password is required",
                    minLength: { value: 8, message: "Min length is 8" }
                  })}
                />
                {errors.newPassword && (
                  <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (val) => val === newPassword || "Passwords do not match"
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button 
                className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}

          <div className="border-t border-border/30 pt-4 text-center">
            <Link href="/login" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}