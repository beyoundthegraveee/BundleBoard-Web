"use client"

import * as React from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, useSession } from "next-auth/react"
import { useMutation } from "@apollo/client/react"
import { RegisterDocument } from "@/graphql/generated"
import { toast } from "sonner"
import TermsDialog from "@/components/terms/TermsDialog"
import { GoogleIcon } from "@/lib/socialLinks"

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  termsAccepted: boolean;
}

function RegisterFormContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [executeRegister, { loading: isRegisterLoading }] = useMutation(RegisterDocument)
  const isLoading = status === "loading" || isRegisterLoading;

  const { register, handleSubmit, control, formState: { errors }, setError, clearErrors } = useForm<RegisterFormInputs>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false 
    }
  })

  const password = useWatch({ control, name: "password" });
  const termsAccepted = useWatch({ control, name: "termsAccepted" });

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.isNewUser) {
        toast.success("Google account linked successfully!")
        router.push(`/select-role?email=${encodeURIComponent(session.user?.email || "")}`)
      } else {
        router.push("/")
      }
    }
  }, [status, session, router])

  const onEmailSubmit = async (formData: RegisterFormInputs) => {
    clearErrors();

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
        const serverError = data.register.error.toLowerCase();
        if (serverError.includes("email")) {
          setError("email", { type: "manual", message: "This email is already registered" });
          toast.error("Account already exists with this email.");
        } else if (serverError.includes("username")) {
          setError("username", { type: "manual", message: "This username is already taken" });
          toast.error("Username is already taken.");
        } else {
          toast.error(data.register.error);
        }
      } else {
        toast.success("Identity registered. Proceeding to setup...")
        router.push(`/select-role?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error: any) {
      const primaryMessage = error?.message || "";
      const graphQLMessage = error?.graphQLErrors?.[0]?.message || "";
      const combinedError = `${primaryMessage} ${graphQLMessage}`.toLowerCase();

      if (
        combinedError.includes("duplicate") ||
        combinedError.includes("already registered")
      ) { 
        setError("email", { 
          type: "manual", 
          message: "This email or username is already registered" 
        });
        toast.error("An account with this email or username already exists.");
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
        toast.error(errorMessage)
      }
    }
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
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
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

          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="termsAccepted"
                control={control}
                rules={{ required: "You must accept the terms" }}
                render={({ field }) => (
                  <Checkbox 
                    id="terms" 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    disabled={isLoading}
                    className="rounded-none border-border/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                )}
              />
              <Label 
                htmlFor="terms" 
                className="text-[11px] text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <TermsDialog 
                  trigger={
                    <span className="text-primary hover:underline cursor-pointer font-bold uppercase tracking-wider">
                      Terms of Service
                    </span>
                  }
                />
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-[10px] text-destructive font-medium uppercase tracking-wide mt-1">
                {errors.termsAccepted.message as string}
              </p>
            )}
          </div>

          <Button 
            className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity shadow-sm data-[disabled]:opacity-40" 
            type="submit" 
            disabled={isLoading || !termsAccepted}
          >
            {isRegisterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
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