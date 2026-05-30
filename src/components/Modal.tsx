"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { RoleSelection } from "@/components/RoleSelection"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RoleModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  registeredEmail: string
}

const UPDATE_ROLE_MUTATION = `
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      message
      success
      accessToken
      refreshToken
    }
  }
`;

export function RoleModal({ isOpen, onOpenChange, registeredEmail }: RoleModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorProtocol, setErrorProtocol] = useState<string | null>(null)

  const handleRoleConfirm = async (role: "client" | "author") => {
    setIsLoading(true)
    setErrorProtocol(null)
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: UPDATE_ROLE_MUTATION,
          variables: { 
            input: {
              email: registeredEmail, 
              role: role
            }
          },
        }),
      });

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message || "Internal server error occurred")
      }

      const data = result.data?.updateUserRole
      if (!data?.success) {
        throw new Error(data?.message || "Role configuration mutation failed")
      }

      // Перенаправление на страницу ожидания письма
      const targetUrl = `/mail/verify-email?email=${encodeURIComponent(registeredEmail)}&role=${role}`
      router.push(targetUrl)
    } catch (error: any) {
      console.error("Role update failure:", error)
      setErrorProtocol(error.message || "Critical connection failure")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Контейнер модального окна: убрали border-4, перевели на швейцарские субпиксельные линии */}
      <DialogContent className="sm:max-w-[540px] border border-border/60 rounded-none shadow-2xl bg-card font-sans text-foreground p-0 gap-0 overflow-hidden">
        
        {/* Шапка модального окна */}
        <div className="space-y-2 text-center border-b border-border/40 bg-muted/20 p-6 relative">
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1">
            Security Layer
          </div>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-foreground pt-2">
            One Last Step
          </DialogTitle>
          <DialogDescription className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground/80">
            Configure Account Permission Profile
          </DialogDescription>
        </div>

        {/* Тело модального окна */}
        <div className="p-6 space-y-4">
          
          {/* Блок ошибок в чистом стиле */}
          {errorProtocol && (
            <div className="border border-destructive/20 bg-destructive/5 text-destructive p-4 rounded-none flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 stroke-[1.8] mt-0.5" />
              <div className="text-xs leading-relaxed font-semibold uppercase tracking-wide">
                <span className="font-bold mr-1.5 text-destructive border-b border-destructive/30">Error Matrix:</span> 
                {errorProtocol}
              </div>
            </div>
          )}

          {/* Интегрировали наш идеальный швейцарский компонент выбора роли */}
          <RoleSelection onSelect={handleRoleConfirm} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  )
}