"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, PenTool, Check, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  const [selectedRole, setSelectedRole] = useState<"client" | "author">("client")
  const [isLoading, setIsLoading] = useState(false)
  const [errorProtocol, setErrorProtocol] = useState<string | null>(null)

  const handleConfirm = async () => {
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
              role: selectedRole
            }
          },
        }),
      });

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message || "MUTATION_VALIDATION_FAILED")
      }

      const data = result.data?.updateUserRole
      if (!data?.success) {
        throw new Error(data?.message || "BACKEND_INITIALIZATION_FAILED")
      }

      goToVerify();
    } catch (error: any) {
      console.error("Failed to update role:", error)
      setErrorProtocol(error.message || "CRITICAL_SERVER_DROP")
    } finally {
      setIsLoading(false)
    }
  }

  const goToVerify = () => {
    const targetUrl = `/mail/verify-email?email=${encodeURIComponent(registeredEmail)}&role=${selectedRole}`
    router.push(targetUrl)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white font-mono text-black p-6 gap-0">
        
        <DialogHeader className="mb-6 relative">
          <div className="absolute -top-6 -left-6 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5">
            Securing_Node...
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-left leading-none mt-2">
            One_Last_Step
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-left mt-1">
            Configure_BundleBoard_Node_Permissions
          </DialogDescription>
        </DialogHeader>

        {errorProtocol && (
          <div className="border-2 border-red-600 bg-red-50 text-red-600 p-3 mb-4 rounded-none flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <div className="text-[9px] font-black uppercase tracking-wide leading-tight">
              <span className="bg-red-600 text-white px-1 mr-1">FAIL:</span> {errorProtocol}
            </div>
          </div>
        )}

        <div className="grid gap-4 py-2 mb-6">
          <div
            onClick={() => setSelectedRole("client")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-none border-4 border-black cursor-pointer select-none duration-150 transition-all",
              selectedRole === "client" 
                ? "bg-zinc-100 translate-x-[2px] translate-y-[2px] shadow-none border-red-600" 
                : "bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            )}
          >
            <div className={cn(
              "p-2 rounded-none border-2 border-black transition-colors duration-150",
              selectedRole === "client" ? "bg-black text-white" : "bg-zinc-50 text-black"
            )}>
              <User className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-black text-xs uppercase tracking-tight", selectedRole === "client" ? "text-red-600" : "text-black")}>
                Buyer_Node
              </p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5 tracking-wide truncate">
                Acquire_High_Quality_Assets
              </p>
            </div>
            {selectedRole === "client" && (
              <div className="h-5 w-5 border-2 border-black bg-black text-white flex items-center justify-center shadow-[1px_1px_0px_rgba(239,68,68,1)]">
                <Check className="h-3 w-3 stroke-[4]" />
              </div>
            )}
          </div>

          <div
            onClick={() => setSelectedRole("author")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-none border-4 border-black cursor-pointer select-none duration-150 transition-all",
              selectedRole === "author" 
                ? "bg-zinc-100 translate-x-[2px] translate-y-[2px] shadow-none border-red-600" 
                : "bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            )}
          >
            <div className={cn(
              "p-2 rounded-none border-2 border-black transition-colors duration-150",
              selectedRole === "author" ? "bg-black text-white" : "bg-zinc-50 text-black"
            )}>
              <PenTool className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-black text-xs uppercase tracking-tight", selectedRole === "author" ? "text-red-600" : "text-black")}>
                Author_Node
              </p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5 tracking-wide truncate">
                Deploy_Digital_Products
              </p>
            </div>
            {selectedRole === "author" && (
              <div className="h-5 w-5 border-2 border-black bg-black text-white flex items-center justify-center shadow-[1px_1px_0px_rgba(239,68,68,1)]">
                <Check className="h-3 w-3 stroke-[4]" />
              </div>
            )}
          </div>
        </div>
        <Button 
          className="w-full py-6 rounded-none border-4 border-black bg-black text-white font-black uppercase text-xs shadow-[6px_6px_0px_rgba(239,68,68,1)] hover:bg-zinc-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150" 
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-red-600 stroke-[3]" />
              <span>Deploying_Identity...</span>
            </div>
          ) : (
            "Confirm_&_Check_Email"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}