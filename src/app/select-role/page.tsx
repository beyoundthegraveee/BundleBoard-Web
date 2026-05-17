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
    <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">One last thing!</CardTitle>
          <CardDescription className="text-lg">
            How do you plan to use BundleBoard?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleSelection onSelect={handleRoleConfirm} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}