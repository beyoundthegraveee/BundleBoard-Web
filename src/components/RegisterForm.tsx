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
      <Card className="w-full max-w-md mx-auto border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] font-mono">
        <CardHeader className="space-y-1 text-center border-b-4 border-black bg-zinc-50">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Sign_Up</CardTitle>
          <CardDescription className="font-bold uppercase text-[10px] opacity-70">
            Create_Node_Identity_BundleBoard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 p-8">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="border-2 border-black rounded-none font-black uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              onClick={() => handleSocialLogin('google')} 
              disabled={isLoading}
            >
              <FaGoogle className="mr-2 h-4 w-4 text-[#DB4437]" />
              Continue_with_Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-black" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black">
              <span className="bg-white px-2 italic">Register_New_Identity</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {serverError && (
              <Alert className="border-2 border-red-600 rounded-none bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 font-bold uppercase text-[10px]">
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="username" className="font-black uppercase text-xs">Username</Label>
              <Input
                id="username"
                className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-red-600 font-bold"
                placeholder="USER_ID"
                disabled={isLoading}
                {...register("username", { 
                  required: "Username is required",
                  minLength: { value: 3, message: "Min length is 3" }
                })}
              />
              {errors.username && (
                <p className="text-[9px] text-red-600 font-black uppercase italic">
                  {errors.username.message as string}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="font-black uppercase text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-red-600 font-bold"
                placeholder="EMAIL_ADDRESS"
                disabled={isLoading}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-[9px] text-red-600 font-black uppercase italic">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="font-black uppercase text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-red-600 font-bold"
                placeholder="SECURE_KEY"
                disabled={isLoading}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Min length is 8" }
                })}
              />
              {errors.password && (
                <p className="text-[9px] text-red-600 font-black uppercase italic">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="font-black uppercase text-xs">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-red-600 font-bold"
                placeholder="CONFIRM_KEY"
                disabled={isLoading}
                {...register("confirmPassword", { 
                  required: "Confirm your password",
                  validate: (val) => val === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-[9px] text-red-600 font-black uppercase italic">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <Button 
              className="w-full mt-2 bg-black text-white rounded-none font-black uppercase shadow-[6px_6px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all py-6" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Complete_Registration"
              )}
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