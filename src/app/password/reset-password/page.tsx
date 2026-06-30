"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useMutation } from "@apollo/client/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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
import { toast } from "sonner"

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
  const token = searchParams.get("token")
  
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  })

  const [confirmReset, { loading: isLoading }] = useMutation<
    ConfirmPasswordResetMutation,
    ConfirmPasswordResetMutationVariables
  >(ConfirmPasswordResetDocument)

  useEffect(() => {
    if (!token) {
      toast.error("Secure token not found. Action denied.")
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Reset token is missing or invalid. Please request a new link.")
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
        toast.success("Password changed successfully! Redirecting to login...")
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        toast.error(result?.message || "Invalid or expired recovery token.")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
      toast.error(errorMessage)
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
          
          {!token && (
            <div className="py-8 text-center border border-dashed border-destructive/30 bg-destructive/5 text-destructive font-bold uppercase text-[10px] tracking-widest">
              Action Denied: Missing Token
            </div>
          )}

          {isSuccess && (
            <div className="py-8 text-center border border-dashed border-primary/30 bg-primary/5 text-primary font-bold uppercase text-[10px] tracking-widest">
              Override Complete. Redirecting...
            </div>
          )}

          {token && !isSuccess && (
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
                    validate: (val, formValues) => val === formValues.newPassword || "Passwords do not match"
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