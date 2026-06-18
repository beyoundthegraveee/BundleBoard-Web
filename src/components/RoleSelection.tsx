"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, PenTool, Loader2 } from "lucide-react"
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
      description: "Access the curation platform to browse and acquire production-grade assets.",
      icon: User,
      number: "01"
    },
    {
      id: "author",
      title: "Author",
      description: "Deploy digital products, license vector streams, and manage your brand pipeline.",
      icon: PenTool,
      number: "02"
    },
  ] as const;

  const handleRoleConfirm = async (role: "client" | "author") => {
    if (!email) {
      toast.error("Identity transmission failed: Missing payload address.")
      return
    }
    
    try {
      const { data } = await executeUpdateRole({
        variables: {
          input: { email, role }
        }
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
        toast.success("Role configuration finalized.")
        router.push(`/mail/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(responseData?.message || "Role configuration mutation failed")
      }
    } catch (error: any) {
      console.error("Role update failure:", error)
      toast.error(error.message || "Critical connection failure")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => {
          const isSelected = selected === role.id;
          return (
            <div
              key={role.id}
              onClick={() => !isLoading && setSelected(role.id)}
              className={cn(
                "group relative flex flex-col p-8 rounded-none border cursor-pointer select-none transition-all duration-300 bg-background/50 backdrop-blur-sm",
                isSelected 
                  ? "border-primary bg-primary/[0.03]" 
                  : "border-border/40 hover:border-border"
              )}
            >
              <div className="flex justify-between items-start mb-8">
                <span className={cn(
                  "font-mono text-[10px] tracking-widest uppercase transition-colors duration-300",
                  isSelected ? "text-primary" : "text-muted-foreground/50"
                )}>
                  Seq // {role.number}
                </span>
                
                {isSelected ? (
                  <span className="font-mono text-[10px] text-primary uppercase tracking-widest bg-primary/10 px-2 py-1">
                    Active
                  </span>
                ) : (
                  <role.icon className="h-4 w-4 text-muted-foreground/40 transition-colors duration-300 group-hover:text-muted-foreground/80 stroke-[1.5]" />
                )}
              </div>

              {/* Основной контент */}
              <div className="mt-auto space-y-4">
                <h3 className={cn(
                  "font-display text-base md:text-lg font-bold uppercase tracking-widest transition-colors duration-300",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {role.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground opacity-80">
                  {role.description}
                </p>
              </div>

              <div className={cn(
                "absolute bottom-0 left-0 h-[2px] transition-all duration-500",
                isSelected ? "w-full bg-primary" : "w-0 bg-border group-hover:w-1/3"
              )} />
            </div>
          );
        })}
      </div>

      <Button 
        className={cn(
          "w-full h-14 rounded-none font-display font-bold uppercase text-xs md:text-sm tracking-[0.2em] transition-all duration-500 select-none overflow-hidden relative",
          selected
            ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            : "bg-transparent border border-border/40 text-muted-foreground/40 cursor-not-allowed hover:bg-transparent"
        )}
        disabled={!selected || isLoading}
        onClick={() => selected && handleRoleConfirm(selected)}
      >
        {isLoading ? (
          <div className="flex items-center gap-3 font-mono text-xs">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Transmitting Data...</span>
          </div>
        ) : (
          <span className="relative z-10">
            {selected ? "Initialize Session →" : "Select Node Identity"}
          </span>
        )}
        
        {selected && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent -translate-x-full animate-[shine_3s_infinite]" />
        )}
      </Button>
    </div>
  );
}