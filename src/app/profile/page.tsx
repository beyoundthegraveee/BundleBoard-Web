"use client";

import React, { useState } from 'react'
import { useSession } from "next-auth/react"
import { Loader2, Settings, LogOut, Terminal, Plus, BarChart3, Cpu } from "lucide-react"
import Link from 'next/link'
import { useAuthActions } from '@/lib/useAuthActions'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { PurchasedVault } from '@/components/PurchaseVault'
import { BillingLedger } from '@/components/BillingLedger'
import UserCommentsLog from '@/components/UserCommentsLog'
import { DeployAssetModal } from '@/components/DeployAssetModal'
import { InventoryItemCard } from '@/components/InventoryItemCard'
import { useQuery } from '@apollo/client/react'
import { GetUserProfileDocument } from '@/graphql/generated'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { terminateSession } = useAuthActions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, loading: isProfileLoading, error, refetch } = useQuery(GetUserProfileDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network',
  });

  const userData = data?.getUserProfile;

  if (status === "loading" || isProfileLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
        <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
        <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Verifying access rights...</span>
      </div>
    )
  }

  if (error) {
    return (
       <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans text-destructive">
         <p>Critical System Error: {error.message}</p>
       </div>
    )
  }

  const isAuthor = userData?.roles?.includes("author")
  const totalSpent = userData?.purchases?.reduce((acc: number, curr: any) => acc + Number(curr?.amount || 0), 0).toFixed(2) || "0.00"
  let totalAssetsCount = 0;
  if (userData?.purchases) {
    userData.purchases.forEach((purchase: any) => {
      totalAssetsCount += purchase?.items?.length || 0;
    });
  }

  return (
    <AuroraBackground className="p-6 md:p-10 lg:p-12 relative justify-start items-stretch">
      <nav className="mb-12 border-b border-border/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary">
            <span className="h-1.5 w-1.5 bg-primary rounded-none animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Access Scope: {isAuthor ? "Partner Privileges Enabled" : "Standard Client Account"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight font-display text-foreground">
            User Profile
          </h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        <div className="lg:col-span-4 space-y-6">
          <section className="border border-border/60 bg-card p-6 rounded-none shadow-md relative">
            <ProfileAvatar 
              userData={userData || null}
              onUpdate={() => refetch()} 
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

          <div className="border border-border/40 bg-muted/20 p-4 rounded-none text-[11px] tracking-wide text-muted-foreground uppercase backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground border-b border-border/30 pb-2 mb-2">
              <Terminal size={12} /> System Registry
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between"><span>Status:</span> <span className="text-foreground">{userData?.status}</span></div>
              <div className="flex justify-between"><span>Authority:</span> <span className="text-foreground">{isAuthor ? "Platform Partner" : "Standard Client"}</span></div>
            </div>
          </div>

          {userData?.id && <UserCommentsLog userId={userData.id} />}
        </div>

        <div className="lg:col-span-8 space-y-10">
          {isAuthor && (
            <section className="border border-border/60 p-6 bg-card rounded-none shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-primary stroke-[1.8]" />
                    <h3 className="text-xl font-bold uppercase tracking-wider font-display text-foreground">Author Station</h3>
                  </div>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">Deploy and monitor studio assets</p>
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
                      col ? (
                        <InventoryItemCard 
                          key={col.id} 
                          collection={col} 
                          onRefreshNeeded={() => refetch()} 
                        />
                      ) : null
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

          <PurchasedVault purchases={userData?.purchases as any} totalAssetsCount={totalAssetsCount} />
          
          <BillingLedger purchases={userData?.purchases as any} totalSpent={totalSpent} />
        </div>

      </div>

      {isAuthor && (
        <DeployAssetModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()} 
        />
      )}
    </AuroraBackground>
  )
}