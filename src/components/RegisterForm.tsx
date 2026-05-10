"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleModal } from "@/components/Modal"
import { useRouter } from "next/navigation"
import { FaGoogle } from "react-icons/fa"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"

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
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
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

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      const regData = result.data?.register

      if (regData?.error) {
        setServerError(regData.error)
      } else {
        setRegisteredEmail(data.email) 
        setIsRoleModalOpen(true)
      }
    } catch (error: any) {
      setServerError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/select-role" })
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with BundleBoard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Сетка изменена на 1 колонку, так как остался только Google */}
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
                placeholder="johndoe"
                disabled={isLoading}
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
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
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
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
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button className="w-full mt-2" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
      <RoleModal 
        isOpen={isRoleModalOpen} 
        onOpenChange={setIsRoleModalOpen} 
        registeredEmail={registeredEmail} 
      />
    </>
  )
}