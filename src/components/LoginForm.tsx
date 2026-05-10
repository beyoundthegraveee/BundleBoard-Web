"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Loader2, AlertCircle} from "lucide-react"
import { FaGoogle } from "react-icons/fa"
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
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callBackUrl = searchParams.get("callbackUrl") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setServerError(null)
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl: callBackUrl,
      })

      if (result?.error) {
        throw new Error(result.error)
      } else {
        router.push(callBackUrl)
        router.refresh()
      }
    } catch (error: any) {
      setServerError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: callBackUrl })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Choose your preferred login method
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        
        <div className="grid grid-cols-1 gap-4">
          <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
            <FaGoogle className="mr-2 h-4 w-4 text-[#DB4437]" />
              Continue with Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              disabled={isLoading}
              {...register("username", { 
                required: "Username is required",
                minLength: { value: 3, message: "Min length is 3" }
              })}
            />
            {errors.username && (
              <p className="text-[10px] text-red-500 font-medium ml-1">
                {errors.username.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" title="Forgot password?" className="text-xs text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Min length is 8" }
              })}
            />
            {errors.password && (
              <p className="text-[10px] text-red-500 font-medium ml-1">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <Button className="w-full mt-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}