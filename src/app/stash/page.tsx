"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, FolderLock, Download, AlertTriangle, Clock } from 'lucide-react'
import LikeButton from '@/components/LikeButton'
import { FALLBACK_IMAGE } from '@/lib/constants'
import { useQuery } from '@apollo/client/react'
import { GetUserProfileDocument } from '@/graphql/generated'

export default function StashPage() {
  const { status } = useSession()
  
  const { data, loading, error } = useQuery(GetUserProfileDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network'
  })

  const userData = data?.getUserProfile
  const purchases = userData?.purchases || []
  const totalAssetsCount = useMemo(() => {
    return purchases.reduce((acc: any, curr: any) => acc + (curr?.items?.length || 0), 0)
  }, [purchases])

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
         <Loader2 className="animate-spin h-6 w-6 text-primary stroke-[1.5]" />
      </main>
    )
  }

  if (status === "unauthenticated" || error) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="p-4 border border-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide bg-destructive/5 rounded-none max-w-md">
          [SECURE_ACCESS_DENIED]: Authentication token required or database pipeline failure.
        </div>
        <Link href="/login" className="mt-4 border border-border/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors">
          Initialize Auth Sequence
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-muted-foreground">Node Control</span>
          <span className="opacity-30">/</span>
          <span className="text-primary flex items-center gap-1">
            <FolderLock size={10} className="text-primary" /> Secure Stash
          </span>
        </div>
        <header className="border-b border-white/[0.06] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
              Purchased Core Vault
            </h1>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
              Isolated directory matrix for commercial usage licenses extraction.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted text-muted-foreground border border-border/40 font-mono">
            {totalAssetsCount} Nodes Decrypted
          </span>
        </header>
        
        {totalAssetsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchases.map((purchase: any) => (
              <React.Fragment key={purchase.id}>
                {purchase.items?.map((item: any) => {
                  if (!item.asset) {
                    return (
                      <div key={item.id} className="border border-dashed border-destructive/40 bg-destructive/5 flex flex-col justify-center items-center aspect-video p-6 text-center">
                        <AlertTriangle size={20} className="text-destructive/60 mb-2" />
                        <div className="text-destructive font-bold uppercase tracking-wider text-[10px] mb-0.5">Asset Offline</div>
                        <div className="text-muted-foreground text-[8px] uppercase tracking-widest">Node destroyed by author</div>
                      </div>
                    )
                  }

                  return (
                    <div key={item.id} className="group border border-border/40 bg-card rounded-none shadow-sm overflow-hidden flex flex-col justify-between relative">
                      <div className="aspect-video border-b border-border/30 overflow-hidden bg-muted relative">
                        <img 
                          src={item.asset.galleryImages?.[0]?.filePath || FALLBACK_IMAGE} 
                          alt={item.asset.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <LikeButton collectionId={item.asset.id} />
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-bold uppercase text-xs text-foreground tracking-tight leading-snug line-clamp-1">
                            {item.asset.name}
                          </span>
                          
                          {/* Цветовая индикация статуса покупки */}
                          <div className={`text-[8px] border px-1.5 py-0.5 font-bold uppercase tracking-wider shrink-0 font-mono
                            ${purchase.status === 'succeeded' ? 'bg-primary/10 text-primary border-primary/30' : 
                              purchase.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                              'bg-destructive/10 text-destructive border-destructive/30'}`}>
                            {purchase.status}
                          </div>
                        </div>

                        {purchase.status === 'succeeded' ? (
                          <a 
                            href={`/api/download/${item.asset.id}`}
                            download
                            className="flex items-center justify-center gap-2 w-full bg-foreground text-background hover:bg-primary hover:text-white p-2.5 font-bold text-[10px] uppercase tracking-widest transition-colors rounded-none"
                          >
                            <Download size={12} /> Download Asset
                          </a>
                        ) : (
                          <div className="flex items-center justify-center gap-2 w-full bg-muted text-muted-foreground p-2.5 font-bold text-[10px] uppercase tracking-widest border border-border/50 cursor-not-allowed">
                            <Clock size={12} className={purchase.status === 'pending' ? "animate-pulse text-yellow-500" : ""} /> 
                            {purchase.status === 'pending' ? 'Awaiting Payment' : 'Payment Failed'}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border/60 p-16 text-center bg-card/20 max-w-xl mx-auto">
            <div className="font-semibold uppercase text-muted-foreground/40 text-xs tracking-widest mb-4">No decryption tokens found</div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase border border-border/80 px-4 py-2 bg-background hover:bg-accent tracking-wider transition-colors rounded-none">
              Browse Active Catalog
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}