"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, PenTool, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useMutation } from "@apollo/client/react"
import { UpdateUserRoleDocument } from "@/graphql/generated"
import { toast } from "sonner"

interface RoleSelectionProps {
  email: string;
}

export function RoleSelection({ email }: RoleSelectionProps) {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [selected, setSelected] = useState<"client" | "author" | null>(null);
  const [executeUpdateRole, { loading: isLoading }] = useMutation(UpdateUserRoleDocument)

  const roles = [
    { id: "client", title: "Client", description: "Access curation tools and acquire production-grade assets.", icon: User, number: "01" },
    { id: "author", title: "Author", description: "Deploy digital products and manage your brand pipeline.", icon: PenTool, number: "02" },
  ] as const;

  const handleRoleConfirm = async (role: "client" | "author") => {
    try {
      const { data } = await executeUpdateRole({ variables: { input: { email, role } } })
      const responseData = data?.updateUserRole
      if (responseData?.success) {
        if (session) await updateSession({ ...session, roles: role === "author" ? ["client", "author"] : ["client"] })
        router.push(`/mail/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(responseData?.message || "Configuration failed")
      }
    } catch (error: any) {
      toast.error("Connection failure")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-border/60 bg-card rounded-none shadow-2xl font-sans">
      <CardHeader className="space-y-1.5 text-center border-b border-border/40 pb-6">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">Select Identity</CardTitle>
        <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
          Choose your node access profile
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-5 p-8">
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => !isLoading && setSelected(role.id)}
                className={cn(
                  "relative flex flex-col p-5 border cursor-pointer transition-all duration-300",
                  isSelected ? "border-primary bg-accent/20" : "border-border/60 bg-background hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className={cn("p-2 border", isSelected ? "border-primary text-primary" : "border-border/60 text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">{role.number}</span>
                </div>
                <h3 className="font-semibold uppercase text-[11px] tracking-wider text-foreground mb-1">{role.title}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{role.description}</p>
              </div>
            )
          })}
        </div>

        <Button 
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity"
          disabled={!selected || isLoading}
          onClick={() => selected && handleRoleConfirm(selected)}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Identity"}
        </Button>
      </CardContent>
    </Card>
  )
}