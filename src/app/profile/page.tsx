"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { Loader2, Settings, LogOut, Plus, BarChart3, Cpu, Download, Archive, ChevronDown } from "lucide-react" // Добавили ChevronDown
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
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { terminateSession } = useAuthActions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { data, loading: isProfileLoading, error, refetch } = useQuery(GetUserProfileDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) {
      toast.error(`[SYSTEM_PIPELINE_ERROR]: ${error.message}`);
    }
  }, [error]);

  const userData = data?.getUserProfile;

  if (status === "loading" || isProfileLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
        <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
        <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Verifying access rights...</span>
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

  let authorTotalDownloads = 0;
  let authorTotalRevenue = 0;
  const authorCollectionsCount = userData?.authoredCollections?.length || 0;

  if (userData?.authoredCollections) {
    userData.authoredCollections.forEach((col: any) => {
      if (col) {
        const downloads = col.downloadCount || 0;
        authorTotalDownloads += downloads;
        const price = col.price || 0;
        authorTotalRevenue += (downloads * price);
      }
    });
  }

  const groupedCollections = userData?.authoredCollections?.reduce((acc: Record<string, any[]>, col: any) => {
    if (!col) return acc;
    const categoryName = col.tags && col.tags.length > 0 ? col.tags[0].name : "Uncategorized";
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(col);
    return acc;
  }, {});

  return (
    <AuroraBackground className="p-4 sm:p-6 md:p-10 lg:p-12 pb-24 min-h-[calc(100vh-5rem)] h-full relative justify-start items-stretch">
      <nav className="mb-8 md:mb-12 border-b border-border/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary">
            <span className="h-1.5 w-1.5 bg-primary rounded-none animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Access Scope: {isAuthor ? "Partner Privileges Enabled" : "Standard Client Account"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight font-display text-foreground">
            User Profile
          </h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 relative z-10">
        
        <div className="lg:col-span-4 space-y-6">
          <section className="border border-border/60 bg-card p-4 md:p-6 rounded-none shadow-md relative">
            <ProfileAvatar 
              userData={userData || null}
              onUpdate={() => refetch()} 
            />

            <div className="space-y-2 border-t border-border/30 pt-4 mt-4">
              <Link href="/settings" className="flex items-center justify-between w-full border border-border/60 bg-background text-foreground p-3 hover:bg-accent text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors rounded-none group">
                Settings Config <Settings size={14} className="text-muted-foreground group-hover:rotate-45 transition-transform" />
              </Link>
              <button onClick={() => terminateSession()} className="flex items-center justify-between w-full border border-destructive/40 text-destructive bg-background p-3 hover:bg-destructive/5 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors rounded-none">
                Sign Out <LogOut size={14} />
              </button>
            </div>
          </section>

          {userData?.id && <UserCommentsLog userId={userData.id} />}
        </div>

        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          {isAuthor && (
            <section className="border border-border/60 p-4 md:p-6 bg-card rounded-none shadow-md flex flex-col max-h-none md:max-h-[900px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border/40 pb-4 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-primary stroke-[1.8]" />
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider font-display text-foreground">Author Station</h3>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-medium uppercase text-muted-foreground">Deploy and monitor studio assets</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 font-semibold text-xs uppercase hover:opacity-90 transition-opacity rounded-none tracking-wider">
                  <Plus size={14} /> Deploy Asset
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 shrink-0">
                <div className="border border-border/40 p-3 md:p-4 bg-background">
                  <div className="text-[8px] md:text-[9px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <Archive size={11} className="shrink-0"/> <span className="truncate">Collections</span>
                  </div>
                  <div className="text-lg md:text-xl font-bold mt-1 text-foreground">
                    {authorCollectionsCount}
                  </div>
                </div>

                <div className="border border-border/40 p-3 md:p-4 bg-background">
                  <div className="text-[8px] md:text-[9px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <Download size={11} className="shrink-0"/> <span className="truncate">Downloads</span>
                  </div>
                  <div className="text-lg md:text-xl font-bold mt-1 text-foreground">
                    {authorTotalDownloads}
                  </div>
                </div>

                <div className="border border-border/40 p-3 md:p-4 bg-background col-span-2">
                  <div className="text-[8px] md:text-[9px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <BarChart3 size={11} className="shrink-0"/> <span className="truncate">Est. Revenue</span>
                  </div>
                  <div className="text-lg md:text-xl font-bold mt-1 text-primary truncate">
                    ${authorTotalRevenue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-4 shrink-0">Active Product Inventory</span>
                
                <div className="overflow-y-visible md:overflow-y-auto pr-0 md:pr-2 pb-2 space-y-6 md:space-y-8 flex-1 min-h-0 md:custom-scrollbar">
                  {groupedCollections && Object.keys(groupedCollections).length > 0 ? (
                    Object.entries(groupedCollections).map(([category, items]) => (
                      // 💡 Заменили старый код на новый умный компонент CategoryGroup
                      <CategoryGroup 
                        key={category} 
                        category={category} 
                        items={items} 
                        onRefreshNeeded={() => refetch()} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border/40 bg-background text-[9px] md:text-[10px] font-semibold uppercase text-muted-foreground/50 tracking-wider">
                      No product nodes submitted by this station.
                    </div>
                  )}
                </div>
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

// 💡 НОВЫЙ КОМПОНЕНТ: Сворачиваемая категория (Аккордеон)
function CategoryGroup({ category, items, onRefreshNeeded }: { category: string, items: any[], onRefreshNeeded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Шапка категории: кликабельна только на мобилках */}
      <div 
        className="flex items-center justify-between gap-3 border-b border-border/20 pb-2 cursor-pointer md:cursor-default select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-primary">
            {category}
          </span>
          <span className="text-[8px] md:text-[9px] font-medium bg-muted px-2 py-0.5 text-muted-foreground rounded-none">
            {items.length} ASSETS
          </span>
        </div>
        {/* Иконка стрелочки видна только на телефонах */}
        <ChevronDown 
          size={14} 
          className={`md:hidden text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {/* САМАЯ ВАЖНАЯ СТРОКА ДЛЯ CSS: 
        Если isOpen = true, ставим 'grid'.
        Если isOpen = false, ставим 'hidden md:grid' (на телефоне скроется, на ПК md:grid перебьет hidden).
      */}
      <div className={`grid-cols-1 sm:grid-cols-2 gap-3 ${isOpen ? 'grid' : 'hidden md:grid'}`}>
        {items.map((col: any) => (
          <InventoryItemCard 
            key={col.id} 
            collection={col} 
            onRefreshNeeded={onRefreshNeeded} 
          />
        ))}
      </div>
    </div>
  );
}