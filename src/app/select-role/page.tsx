"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { RoleSelection } from "@/components/RoleSelection"
import { Card } from "@/components/ui/card"

function SelectRolePageContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email")
  const userEmail = emailFromUrl || session?.user?.email

  if (status === "loading" && !emailFromUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  if (!userEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm border-destructive/20 bg-destructive/[0.02] rounded-none shadow-none text-center p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-destructive">
            Access Denied: Session Invalid
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <RoleSelection email={userEmail} />
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    }>
      <SelectRolePageContent />
    </Suspense>
  )
}