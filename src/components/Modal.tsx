"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, PenTool, CheckCircle2, Loader2 } from "lucide-react"
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
      success
      message
    }
  }
`;

export function RoleModal({ isOpen, onOpenChange, registeredEmail }: RoleModalProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"client" | "author">("client")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (selectedRole === "client") {
        goToVerify();
        return;
    }

    setIsLoading(true)
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
      if (result.errors) throw new Error(result.errors[0].message)

      goToVerify();
    } catch (error) {
      console.error("Failed to update role:", error)
      goToVerify();
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">One last step!</DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose your role to customize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            onClick={() => setSelectedRole("client")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              selectedRole === "client" 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              selectedRole === "client" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">I am a Client</p>
              <p className="text-xs text-muted-foreground">Looking for services and bundles</p>
            </div>
            {selectedRole === "client" && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </div>

          <div
            onClick={() => setSelectedRole("author")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              selectedRole === "author" 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              selectedRole === "author" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              <PenTool className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">I am an Author</p>
              <p className="text-xs text-muted-foreground">Offering my expertise and skills</p>
            </div>
            {selectedRole === "author" && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </div>
        </div>

        <Button 
          className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20" 
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm & Check Email
        </Button>
      </DialogContent>
    </Dialog>
  )
}