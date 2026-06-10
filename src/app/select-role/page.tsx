"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { RoleSelection } from "@/components/RoleSelection"

function SelectRolePageContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email")
  const userEmail = emailFromUrl || session?.user?.email

  if (status === "loading" && !emailFromUrl) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background font-sans">
        <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
        <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">
          Establishing Secure Link...
        </span>
      </div>
    )
  }

  if (!userEmail) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background font-sans text-center px-4">
        <span className="font-bold uppercase tracking-widest text-xs text-destructive border border-destructive/30 bg-destructive/5 px-4 py-3 rounded-none">
          Access Denied: Session Context Invalidation
        </span>
      </div>
    )
  }

  return (
  <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-12 font-sans text-foreground relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
    <div className="w-full max-w-2xl border border-border/60 rounded-none shadow-2xl bg-card overflow-hidden relative z-10">
      
      <div className="space-y-2 text-center border-b border-border/40 bg-muted/20 p-6 relative">
        <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1">
          Security Layer
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground pt-2">
          One Last Step
        </h1>
        <p className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">
          Configure Account Permission Profile
        </p>
      </div>
      
      <div className="p-8">
        {userEmail ? (
          <RoleSelection email={userEmail} />
        ) : (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-primary" size={24} />
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
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background font-sans">
        <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
        <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">
          Mounting Interface Components...
        </span>
      </div>
    }>
      <SelectRolePageContent />
    </Suspense>
  )
}