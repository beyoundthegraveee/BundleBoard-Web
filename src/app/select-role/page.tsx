"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RoleSelection } from "@/components/RoleSelection"
import { AlertTriangle } from "lucide-react"

const UPDATE_USER_ROLE_MUTATION = `
 mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) { 
      success 
      message
      accessToken
      refreshToken
    }
  }
`

export default function SelectRolePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRoleConfirm = async (role: "client" | "author") => {
    setLoading(true)
    setErrorMessage(null)
    try {  
      if (!session?.user?.email) {
        throw new Error("User email not found in session")
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.accessToken}` 
        },
        body: JSON.stringify({
          query: UPDATE_USER_ROLE_MUTATION,
          variables: {
            input: { email: session?.user?.email, role }
          }
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message || "Internal server error occurred")
      }

      const data = result.data?.updateUserRole

      if (data?.success) {
        await update({ 
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: role,
          isNewUser: false 
        })
        router.push("/")
        router.refresh()
      } else {
        setErrorMessage(data?.message || "Role configuration mutation failed")
      }
    } catch (error: any) {
      console.error("Role update failure:", error)
      setErrorMessage(error.message || "Critical connection failure")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-12 font-sans text-foreground relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-2xl border border-border/60 rounded-none shadow-2xl bg-card overflow-hidden relative z-10">
        <div className="space-y-2 text-center border-b border-border/40 bg-muted/20 p-6 relative">
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1">
            Security Layer
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground pt-2">One Last Step</h1>
          <p className="font-semibold uppercase text-[10px] tracking-widest text-muted-foreground">
            Configure Account Permission Profile
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          {errorMessage && (
            <div className="border border-destructive/20 bg-destructive/5 text-destructive p-4 rounded-none flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 stroke-[1.8] mt-0.5" />
              <div className="text-xs leading-relaxed font-semibold uppercase tracking-wide">
                <span className="font-bold mr-1.5 text-destructive border-b border-destructive/30">Error Matrix:</span> 
                {errorMessage}
              </div>
            </div>
          )}
          <RoleSelection onSelect={handleRoleConfirm} isLoading={loading} />
        </div>

      </div>
    </div>
  )
}