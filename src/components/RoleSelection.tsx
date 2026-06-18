"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, PenTool, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
    {
      id: "client",
      title: "Client",
      description: "Access curation tools and acquire production-grade assets.",
      icon: User,
      number: "01"
    },
    {
      id: "author",
      title: "Author",
      description: "Deploy digital products and manage your brand pipeline.",
      icon: PenTool,
      number: "02"
    },
  ] as const;

  const handleRoleConfirm = async (role: "client" | "author") => {
    if (!email) {
      toast.error("Missing payload address.")
      return
    }
    
    try {
      const { data } = await executeUpdateRole({
        variables: { input: { email, role } }
      })

      const responseData = data?.updateUserRole
      if (responseData?.success) {
        if (session) {
          await updateSession({ 
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            roles: role === "author" ? ["client", "author"] : ["client"],
            isNewUser: false 
          })
        }
        router.push(`/mail/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(responseData?.message || "Configuration failed")
      }
    } catch (error: any) {
      toast.error(error.message || "Connection failure")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selected === role.id;
          const Icon = role.icon;
          
          return (
            <div
              key={role.id}
              onClick={() => !isLoading && setSelected(role.id)}
              className={cn(
                "group relative flex flex-col p-6 rounded-none border transition-all duration-300 cursor-pointer bg-background/50",
                isSelected 
                  ? "border-primary shadow-sm" 
                  : "border-border/40 hover:border-border"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <div className={cn(
                  "p-2 border transition-colors",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border/40 text-muted-foreground"
                )}>
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                  {role.number}
                </span>
              </div>

              <div className="space-y-1.5 mb-2">
                <h3 className={cn(
                  "font-display text-sm font-bold uppercase tracking-widest transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {role.title}
                </h3>
                <p className="font-sans text-xs leading-relaxed text-muted-foreground/70">
                  {role.description}
                </p>
              </div>

              <div className={cn(
                "absolute bottom-0 left-0 h-[1px] transition-all duration-300",
                isSelected ? "w-full bg-primary" : "w-0 bg-primary group-hover:w-full"
              )} />
            </div>
          );
        })}
      </div>

      <Button 
        className={cn(
          "w-full h-12 rounded-none font-display font-bold uppercase text-[10px] tracking-[0.25em] transition-all duration-300",
          selected
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "bg-transparent border border-border/40 text-muted-foreground/40 cursor-not-allowed"
        )}
        disabled={!selected || isLoading}
        onClick={() => selected && handleRoleConfirm(selected)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Configuring...</span>
          </div>
        ) : (
          selected ? "Continue →" : "Select Identity"
        )}
      </Button>
    </div>
  );
}