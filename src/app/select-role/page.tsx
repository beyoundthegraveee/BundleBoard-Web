"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RoleSelection } from "@/components/RoleSelection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SelectRolePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRoleConfirm = async (role: "client" | "author") => {
    setLoading(true)
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
          query: `
            mutation UpdateUserRole($input: UpdateUserRoleInput!) {
              updateUserRole(input: $input) { 
                success 
                message
                accessToken
                refreshToken
              }
            }
          `,
          variables: {
            input: { email: session?.user?.email, role }
          }
        }),
      })

      const result = await response.json()
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
        console.error("Update failed:", data?.message)
      }
    } catch (error) {
      console.error("ROLE_UPDATE_ERROR:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 font-mono">
      <Card className="w-full max-w-2xl border-4 border-black rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white">
        
        <CardHeader className="space-y-1 text-center border-b-4 border-black bg-zinc-50 p-6">
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">One_Last_Step</CardTitle>
          <CardDescription className="font-bold uppercase text-[10px] opacity-70">
            Configure_BundleBoard_Node_Permissions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <RoleSelection onSelect={handleRoleConfirm} isLoading={loading} />
        </CardContent>

      </Card>
    </div>
  )
}