"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
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
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callBackUrl = searchParams.get("callbackUrl") || "/"
  
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, control, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        remember: data.rememberMe,
        redirect: false,
        callbackUrl: callBackUrl,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Invalid username or password")
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success("Authorization successful")
        router.push(callBackUrl)
        router.refresh()
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: callBackUrl })
    } catch (error) {
      toast.error(`Failed to initialize ${provider} login.`)
    }
  }

  const GoogleIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    width="1em" 
    height="1em" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  );

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
          Sign In
        </CardTitle>
        <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
          Authorization Node Key Required
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-5 p-8">
        <div className="grid grid-cols-1 gap-4">
          <Button 
            variant="outline" 
            className="border border-border/80 rounded-none font-semibold uppercase text-[11px] tracking-wider py-5 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => handleSocialLogin('google')} 
            disabled={isLoading}
            type="button"
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-medium tracking-widest text-muted-foreground">
            <span className="bg-card px-3">Or use access key</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">          
          <div className="grid gap-1.5">
            <Label htmlFor="username" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Username</Label>
            <Input
              id="username"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="Enter username"
              disabled={isLoading}
              {...register("username", { 
                required: "Username is required",
                minLength: { value: 3, message: "Min length is 3" }
              })}
            />
            {errors.username && (
              <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Password</Label>
              <Link href="/forgot-password" className="text-[11px] font-medium uppercase tracking-wider text-primary hover:opacity-80 transition-opacity">
                Recover?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="Enter password"
              disabled={isLoading}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Min length is 8" }
              })}
            />
            {errors.password && (
              <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2.5 py-1.5">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="rememberMe"
                  className="rounded-none border-border/80 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer select-none leading-none"
            >
              Remember session identity
            </Label>
          </div>

          <Button 
            className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}