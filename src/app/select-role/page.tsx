"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { RoleSelection } from "@/components/RoleSelection"
import { BackgroundGradient } from "@/components/BackgroundGradient"

function SelectRolePageContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email")
  const userEmail = emailFromUrl || session?.user?.email

  if (status === "loading" && !emailFromUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
        <BackgroundGradient />
        <Loader2 className="animate-spin text-primary mb-5 stroke-[1.5]" size={36} />
        <span className="font-mono font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground relative z-10">
          Establishing Secure Link...
        </span>
      </div>
    )
  }

  if (!userEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4 relative overflow-hidden">
        <BackgroundGradient />
        <span className="font-mono font-bold uppercase tracking-widest text-xs text-destructive border border-destructive/30 bg-destructive/5 px-6 py-4 rounded-none relative z-10 shadow-lg">
          Access Denied: Session Context Invalidation
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 text-foreground relative overflow-hidden">
      <BackgroundGradient />
      
      <div className="w-full max-w-3xl border border-border/40 bg-background/60 backdrop-blur-xl rounded-none shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4 text-center border-b border-border/40 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-primary/10 text-primary font-mono text-[9px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border-b border-r border-primary/20">
            Security Layer // 01
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-foreground pt-4 font-display">
            One Last Step
          </h1>
          <p className="font-mono font-semibold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">
            Configure Account Permission Profile
          </p>
        </div>
        <div className="p-8 md:p-12">
          {userEmail ? (
            <RoleSelection email={userEmail} />
          ) : (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
        <BackgroundGradient />
        <Loader2 className="animate-spin text-primary mb-5 stroke-[1.5]" size={36} />
        <span className="font-mono font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground relative z-10">
          Mounting Interface Components...
        </span>
      </div>
    }>
      <SelectRolePageContent />
    </Suspense>
  )
}