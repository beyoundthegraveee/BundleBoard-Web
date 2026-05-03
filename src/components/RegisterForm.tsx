"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { Loader2, AlertCircle, User, PenTool } from "lucide-react"
import { FaFacebook, FaGoogle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const REGISTER_MUTATION = `
  mutation Register($input: RegisterRequest!) {
    register(input: $input) {
      accessToken
      refreshToken
      error
    }
  }
`;

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callBackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client"
    }
  })

  const password = watch("password");

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setServerError(null)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: REGISTER_MUTATION,
          variables: {
            input: {
              username: data.username,
              email: data.email,
              password: data.password,
              role: data.role,
            },
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      const regData = result.data?.register

      if (regData?.error) {
        setServerError(regData.error)
      } else {
        const loginResult = await signIn("credentials", {
          username: data.username,
          password: data.password,
          redirect: false,
          callbackUrl: callBackUrl,
        })

        if (loginResult?.error) {
          router.push("/login")
        } else {
          router.push(callBackUrl)
          router.refresh()
        }
      }
    } catch (error: any) {
      setServerError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details and choose your role
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>I want to...</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Tabs onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="client" className="flex gap-2">
                      <User className="h-4 w-4" /> Buy
                    </TabsTrigger>
                    <TabsTrigger value="author" className="flex gap-2">
                      <PenTool className="h-4 w-4" /> Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />
          </div>

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
              placeholder="johndoe"
              disabled={isLoading}
              {...register("username", { required: "Username is required" })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              {...register("email", { required: "Email is required" })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password", { required: "Password is required" })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              {...register("confirmPassword", { 
                required: "Confirm your password",
                validate: (val) => val === password || "Passwords do not match"
              })}
            />
          </div>

          <Button className="w-full mt-2" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Registration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}