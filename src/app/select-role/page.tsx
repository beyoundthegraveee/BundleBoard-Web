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
        throw new Error(result.errors[0].message || "INTERNAL_SERVER_ERROR")
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
        setErrorMessage(data?.message || "PROTOCOL_MUTATION_FAILED")
      }
    } catch (error: any) {
      console.error("ROLE_UPDATE_ERROR:", error)
      setErrorMessage(error.message || "CRITICAL_CONNECTION_FAILURE")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12 font-mono text-black">
      <div className="w-full max-w-2xl border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        <div className="space-y-2 text-center border-b-4 border-black bg-zinc-50 p-6 relative">
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5">
            Security_Layer
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">One_Last_Step</h1>
          <p className="font-black uppercase text-[10px] tracking-wider text-zinc-500">
            Configure_BundleBoard_Node_Permissions
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          
          {errorMessage && (
            <div className="border-4 border-red-600 bg-red-50 text-red-600 p-4 rounded-none flex items-start gap-3 shadow-[4px_4px_0px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-5 w-5 shrink-0 stroke-[2.5]" />
              <div className="text-[11px] leading-relaxed font-black uppercase tracking-wide">
                <span className="bg-red-600 text-white px-1 mr-1">CRITICAL_ERROR:</span> 
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