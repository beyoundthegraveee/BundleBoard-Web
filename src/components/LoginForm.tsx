"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { Loader2, AlertCircle, Check } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callBackUrl = searchParams.get("callbackUrl") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setServerError(null)
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        remember: data.rememberMe,
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
    <Card className="w-full max-w-md mx-auto border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] font-mono">
      <CardHeader className="space-y-1 text-center border-b-4 border-black bg-zinc-50">
        <CardTitle className="text-3xl font-black uppercase tracking-tighter">Sign_In</CardTitle>
        <CardDescription className="font-bold uppercase text-[10px] opacity-70">
          Node_Authorization_Required
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
            <span className="bg-white px-2 italic">Or_Legacy_Login</span>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-black uppercase text-xs">Password</Label>
              <Link href="/forgot-password"  className="text-[10px] line-clamp-1 font-black uppercase text-red-600 hover:underline">
                Recover?
              </Link>
            </div>
            <Input
              id="password"
              className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-red-600 font-bold"
              type="password"
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

          <div className="flex items-center space-x-3 py-2">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-[10px] font-black uppercase cursor-pointer select-none leading-none"
            >
              Remember_My_Node
            </Label>
          </div>

          <Button 
            className="w-full mt-2 bg-black text-white rounded-none font-black uppercase shadow-[6px_6px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all py-6" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Initiate_Session"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}