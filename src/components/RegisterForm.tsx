"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaGoogle } from "react-icons/fa"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { useMutation } from "@apollo/client/react"
import { RegisterDocument, SocialRegisterDocument } from "@/graphql/generated"
import { toast } from "sonner"

const generateRandomPassword = () => Math.random().toString(36).slice(-10) + "A1!";

function RegisterFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isSocialSetupFailed, setIsSocialSetupFailed] = useState(false)
  
  const [executeSocialRegister, { loading: isSocialLoading }] = useMutation(SocialRegisterDocument)
  const [executeRegister, { loading: isRegisterLoading }] = useMutation(RegisterDocument)
  
  const isLoading = isSocialLoading || isRegisterLoading;

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const password = watch("password");

  useEffect(() => {
    const mode = searchParams.get("mode")
    const email = searchParams.get("email")
    const username = searchParams.get("username")

    if (mode === "social-setup" && email && username) {
      const executeSocialRegistration = async () => {
        setIsSocialSetupFailed(false)
        try {
          const { data } = await executeSocialRegister({
            variables: {
              input: {
                username,
                email,
                password: generateRandomPassword(),
                role: "client"
              }
            }
          })

          if (data?.socialRegister?.error) {
            throw new Error(data.socialRegister.error)
          }
          
          toast.success("Google account linked successfully")
          router.push(`/select-role?email=${encodeURIComponent(email)}`)
        } catch (error: any) {
          setIsSocialSetupFailed(true)
          toast.error(error.message || "Failed to initialize social record")
        }
      }

      executeSocialRegistration()
    }
  }, [searchParams, router, executeSocialRegister])

  const onEmailSubmit = async (formData: any) => {
    try {
      const { data } = await executeRegister({
        variables: {
          input: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: "client",
          }
        }
      })

      if (data?.register?.error) {
        toast.error(data.register.error)
      } else {
        toast.success("Identity registered. Proceeding to setup...")
        router.push(`/select-role?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.")
    }
  }

  if (searchParams.get("mode") === "social-setup" && !isSocialSetupFailed) {
    return (
      <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans text-center p-12">
        <Loader2 className="animate-spin text-primary mx-auto mb-4 stroke-[1.5]" size={36} />
        <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">
          Registering Core Node via Google...
        </span>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">Sign Up</CardTitle>
        <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
          Create Platform Account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-5 p-8">
        <div className="grid grid-cols-1 gap-4">
          <Button 
            type="button"
            variant="outline" 
            className="border border-border/80 rounded-none font-semibold uppercase text-[11px] tracking-wider py-5 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => signIn('google')} 
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-3.5 w-3.5 opacity-70" />
            Continue with Google
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/30" /></div>
          <div className="relative flex justify-center text-[10px] uppercase font-medium tracking-widest text-muted-foreground">
            <span className="bg-card px-3">Or register via email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onEmailSubmit)} className="grid gap-4">

          <div className="grid gap-1.5">
            <Label htmlFor="username" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Username</Label>
            <Input id="username" className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50" placeholder="Enter username" disabled={isLoading} {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min length is 3" } })} />
            {errors.username && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.username.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Email</Label>
            <Input id="email" type="email" className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50" placeholder="name@example.com" disabled={isLoading} {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.email.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Password</Label>
            <Input id="password" type="password" className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50" placeholder="Minimum 8 characters" disabled={isLoading} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min length is 8" } })} />
            {errors.password && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.password.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="confirmPassword" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Confirm Password</Label>
            <Input id="confirmPassword" type="password" className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50" placeholder="Re-enter password" disabled={isLoading} {...register("confirmPassword", { required: "Confirm your password", validate: (val) => val === password || "Passwords do not match" })} />
            {errors.confirmPassword && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.confirmPassword.message as string}</p>}
          </div>

          <Button className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RegisterFormContent />
    </Suspense>
  )
}