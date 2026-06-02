"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, User, PenTool, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const SOCIAL_REGISTER_MUTATION = `
  mutation SocialRegister($input: SocialRegisterRequest!) {
    socialRegister(input: $input) {
      accessToken
      refreshToken
      error
    }
  }
`;

const generateRandomPassword = () => Math.random().toString(36).slice(-10) + "A1!";

interface RoleSelectionProps {
  onSelect: (role: "client" | "author") => Promise<void>;
  isLoading?: boolean;
}

function RoleSelection({ onSelect, isLoading }: RoleSelectionProps) {
  const [selected, setSelected] = useState<"client" | "author" | null>(null);

  const roles = [
    {
      id: "client",
      title: "Buyer Node",
      description: "Access the curation platform to browse and acquire production-grade assets.",
      icon: User,
    },
    {
      id: "author",
      title: "Author Node",
      description: "Deploy digital products, license vector streams, and manage your brand pipeline.",
      icon: PenTool,
    },
  ] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2 font-sans text-foreground">
      {roles.map((role) => {
        const isSelected = selected === role.id;
        return (
          <div
            key={role.id}
            onClick={() => !isLoading && setSelected(role.id)}
            className={cn(
              "relative flex flex-col p-6 rounded-none border border-border/60 bg-card cursor-pointer select-none transition-all duration-200 shadow-md",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                : "hover:border-foreground/40 hover:bg-muted/10"
            )}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 h-5 w-5 rounded-none border border-primary bg-primary flex items-center justify-center text-primary-foreground">
                <Check className="h-3 w-3 stroke-[2.5]" />
              </div>
            )}

            <div className={cn(
              "mb-6 flex h-12 w-12 items-center justify-center rounded-none border border-border/60 transition-colors duration-200",
              isSelected 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-muted-foreground"
            )}>
              <role.icon className="h-5 w-5 stroke-[1.5]" />
            </div>

            <h3 className={cn(
              "text-xl font-bold uppercase tracking-wider transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {role.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-normal mt-2.5">
              {role.description}
            </p>
          </div>
        );
      })}

      <Button 
        className={cn(
          "md:col-span-2 mt-4 rounded-none font-semibold uppercase text-xs tracking-widest py-6 border transition-all duration-200 select-none shadow-sm",
          selected
            ? "bg-primary text-primary-foreground border-primary hover:opacity-90 cursor-pointer"
            : "bg-muted/30 text-muted-foreground/40 border-border/40 cursor-not-allowed"
        )}
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
            <span>Initializing Protocol</span>
          </div>
        ) : (
          "Confirm Platform Role"
        )}
      </Button>
    </div>
  );
}

function RegisterFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [isSocialMode, setIsSocialMode] = useState(false)
  const [socialUser, setSocialUser] = useState<{ email: string; username: string } | null>(null)

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

  useEffect(() => {
    const mode = searchParams.get("mode")
    const email = searchParams.get("email")
    const username = searchParams.get("username")

    if (mode === "social-setup" && email && username) {
      setIsSocialMode(true)
      setSocialUser({ email, username })
    }
  }, [searchParams])

  const onEmailSubmit = async (data: any) => {
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
              role: data.role.toLowerCase(),
            },
          },
        }),
      })

      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)
      
      const regData = result.data?.register

      if (regData?.error) {
        setServerError(regData.error)
      } else {
        router.push(`/mail/verify-email?email=${encodeURIComponent(data.email)}`)
      }
    } catch (error: any) {
      setServerError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    signIn(provider)
  }

  const handleSocialRegisterSubmit = async (chosenRole: "client" | "author") => {
    if (!socialUser) return
    setIsLoading(true)
    setServerError(null)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SOCIAL_REGISTER_MUTATION,
          variables: {
            input: {
              username: socialUser.username,
              email: socialUser.email,
              password: generateRandomPassword(),
              role: chosenRole.toLowerCase()
            }
          }
        })
      })

      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)

      const regData = result.data?.socialRegister

      if (regData?.error) {
        setServerError(regData.error)
      } else {
        router.push(`/mail/verify-email?email=${encodeURIComponent(socialUser.email)}`)
      }
    } catch (error: any) {
      setServerError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSocialMode && socialUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
        <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
          <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
            Initialize Security Node
          </CardTitle>
          <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
            Assign network identity for {socialUser.email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-5 p-8">
          {serverError && (
            <Alert className="border border-destructive/30 rounded-none bg-destructive/5 flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <AlertDescription className="text-destructive font-semibold uppercase text-[11px] tracking-wider">
                {serverError}
              </AlertDescription>
            </Alert>
          )}

          <RoleSelection 
            onSelect={handleSocialRegisterSubmit} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
          Sign Up
        </CardTitle>
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
            onClick={() => handleSocialLogin('google')} 
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
          {serverError && (
            <Alert className="border border-destructive/30 rounded-none bg-destructive/5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <AlertDescription className="text-destructive font-semibold uppercase text-[11px] tracking-wider">
                {serverError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="username" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Username</Label>
            <Input
              id="username"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="Enter username"
              disabled={isLoading}
              {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min length is 3" } })}
            />
            {errors.username && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.username.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="name@example.com"
              disabled={isLoading}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.email.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min length is 8" } })}
            />
            {errors.password && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.password.message as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="confirmPassword" className="font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="border border-border/60 rounded-none bg-background text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring text-sm font-normal py-5 placeholder:text-muted-foreground/50"
              placeholder="Re-enter password"
              disabled={isLoading}
              {...register("confirmPassword", { 
                required: "Confirm your password",
                validate: (val) => val === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-0.5">{errors.confirmPassword.message as string}</p>}
          </div>

          <Button 
            className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  )
}