"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { Loader2, Settings, LogOut, Terminal, Plus, BarChart3 } from "lucide-react"
import Link from 'next/link'
import { useAuthActions } from '@/lib/useAuthActions'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { PurchasedVault } from '@/components/PurchaseVault'
import { BillingLedger } from '@/components/BillingLedger'
import CommentsSection from '@/components/CommentSection'
import { DeployAssetModal } from '@/components/DeployAssetModal'
import { InventoryItemCard } from '@/components/InventoryItemCard'

const GET_USER_PROFILE = `
  query GetUserProfile {
    getUserProfile {
      id
      username
      email
      avatarUrl
      status
      roles
      authoredCollections {
        id
        name
        price
        description
        previewImage { filePath }
      }
      purchases {
        id
        amount
        currency
        status
        createdAt
        items {
          id
          snapshotPrice
          asset {
            id
            name
            previewImage { filePath fileName }
          }
        }
      }
    }
  }
`;

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { terminateSession } = useAuthActions()

  const fetchUser = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.accessToken}` 
        },
        body: JSON.stringify({ query: GET_USER_PROFILE }),
      })
      const result = await response.json()
      if (!result.errors) setUserData(result.data?.getUserProfile)
    } catch (err) {
      console.error("PROFILE_FETCH_FAILURE:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") fetchUser()
  }, [session, status])

  if (loading || status === "loading") return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
      <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
      <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Verifying access rights...</span>
    </div>
  )

  const isAuthor = userData?.roles?.includes("author")
  const totalSpent = userData?.purchases?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0).toFixed(2) || "0.00"
  const totalAssetsCount = userData?.purchases?.reduce((acc: number, curr: any) => acc + (curr.items?.length || 0), 0) || 0

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-10 lg:p-12 relative">
      
      <nav className="mb-12 border-b border-border/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-primary">
            <span className="h-2 w-2 bg-primary rounded-none" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Access Scope: {isAuthor ? "Partner Privileges Enabled" : "Standard Client Account"}
            </span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Node Control</h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-4 space-y-6">
          <section className="border border-border/60 bg-card p-6 rounded-none shadow-md relative">
            
            <ProfileAvatar 
              userData={userData} 
              accessToken={(session as any)?.accessToken} 
              onUpdate={fetchUser} 
            />
            
            <div className="space-y-1 overflow-hidden mb-6">
              <h2 className="text-lg font-bold uppercase tracking-tight text-foreground truncate">{userData?.username || "Guest Node"}</h2>
              <p className="text-[11px] font-normal text-muted-foreground truncate lowercase">{userData?.email}</p>
            </div>

            <div className="space-y-2 border-t border-border/30 pt-4">
              <Link href="/settings" className="flex items-center justify-between w-full border border-border/60 bg-background text-foreground p-3 hover:bg-accent text-xs font-semibold uppercase tracking-wider transition-colors rounded-none group">
                Settings Configuration <Settings size={14} className="text-muted-foreground group-hover:rotate-45 transition-transform" />
              </Link>
              <button onClick={() => terminateSession()} className="flex items-center justify-between w-full border border-destructive/40 text-destructive bg-background p-3 hover:bg-destructive/5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-none">
                Sign Out Account <LogOut size={14} />
              </button>
            </div>
          </section>

          <div className="border border-border/40 bg-muted/20 p-4 rounded-none text-[11px] tracking-wide text-muted-foreground uppercase">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground border-b border-border/30 pb-2 mb-2">
              <Terminal size={12} /> System Registry
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between"><span>Status:</span> <span className="text-foreground">{userData?.status}</span></div>
              <div className="flex justify-between"><span>Authority:</span> <span className="text-foreground">{isAuthor ? "Platform Partner" : "Standard Client"}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          
          {isAuthor && (
            <section className="border border-border/60 p-6 bg-card rounded-none shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">Author Station</h3>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">Deploy and monitor studio assets</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 font-semibold text-xs uppercase hover:opacity-90 transition-opacity rounded-none tracking-wider">
                  <Plus size={14} /> Deploy Asset
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-border/40 p-4 bg-background">
                  <div className="text-[9px] font-semibold uppercase text-muted-foreground flex items-center gap-1"><BarChart3 size={11}/> Total Sales</div>
                  <div className="text-xl font-bold mt-1 text-foreground">0 Units</div>
                </div>
                <div className="border border-border/40 p-4 bg-background">
                  <div className="text-[9px] font-semibold uppercase text-muted-foreground">Net Profit</div>
                  <div className="text-xl font-bold mt-1 text-primary">$0.00</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Active Product Inventory</span>
                {userData?.authoredCollections && userData.authoredCollections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userData.authoredCollections.map((col: any) => (
                      <InventoryItemCard key={col.id} collection={col} accessToken={(session as any)?.accessToken || ""} onRefreshNeeded={fetchUser} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border/40 bg-background text-[10px] font-semibold uppercase text-muted-foreground/50 tracking-wider">
                    No product nodes submitted by this station.
                  </div>
                )}
              </div>
            </section>
          )}

          <PurchasedVault purchases={userData?.purchases} totalAssetsCount={totalAssetsCount} />
          
          <BillingLedger purchases={userData?.purchases} totalSpent={totalSpent} />
          
          <CommentsSection targetId={userData?.id} />

        </div>
      </div>

      {isAuthor && (
        <DeployAssetModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userData?.id || ""}
          accessToken={(session as any)?.accessToken || ""}
          onSuccess={fetchUser} 
        />
      )}
    </main>
  )
}