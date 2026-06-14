"use client"

import React from 'react'
import Link from 'next/link'
import { FolderLock, ExternalLink, AlertTriangle } from "lucide-react"
import { FALLBACK_IMAGE } from '@/lib/constants'

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";

interface PurchasedVaultProps {
  purchases: any[]
  totalAssetsCount: number
}

export function PurchasedVault({ purchases, totalAssetsCount }: PurchasedVaultProps) {
  const totalAmount = React.useMemo(() => {
    if (!purchases) return 0;
    return purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [purchases]);

  const previewItems = React.useMemo(() => {
    if (!purchases) return []
    return purchases
      .flatMap(p => (p.items || []).map((item: any) => ({ ...item, pStatus: p.status })))
      .slice(0, 3)
  }, [purchases])

  return (
    <section className="border border-border/60 bg-card p-6 rounded-none shadow-md space-y-6 font-sans text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex items-start gap-3">
          <FolderLock size={20} className="text-primary stroke-[1.8] mt-1" />
          <div className="flex flex-col">
            <h3 className="text-xl font-bold uppercase tracking-wider font-display text-foreground">
              Core Vault Directory
            </h3>

            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest">
                Total Value: ${totalAmount.toFixed(2)}
              </span>
              {totalAmount === 0 && totalAssetsCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 border border-primary/20">
                  Obtained for Free
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 border border-border/40 text-muted-foreground font-mono rounded-none tracking-wider">
          {totalAssetsCount} NODES
        </span>
      </div>

      {totalAssetsCount > 0 ? (
        <div className="space-y-4">
          <div className="divide-y divide-border/20 border-b border-border/20">
            {previewItems.map((item: any, idx: number) => {
              const assetData = item.asset;

              if (!assetData) {
                return (
                  <div key={item.id || idx} className="py-3 flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                      <AlertTriangle size={14} className="text-destructive" />
                    </div>
                    <div className="min-w-0 flex-1 text-xs font-bold text-destructive uppercase tracking-wider">
                      Offline Node
                    </div>
                  </div>
                )
              }

              const imagePath = assetData.galleryImages?.[0]?.filePath || "";
              const imageUrl = imagePath.startsWith('http') 
                ? imagePath 
                : imagePath ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(imagePath)}` : FALLBACK_IMAGE;

              return (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-background border border-border/40 shrink-0 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={assetData.name || "Asset"} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold uppercase tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
                        {assetData.name || `Asset Node #${item.id || "Unknown"}`}
                      </h4>
                      <div className="flex items-center gap-2.5">
                        <span className="block text-[10px] text-muted-foreground uppercase tracking-wide font-mono">
                          Status // {item.pStatus}
                        </span>
                        {/* --- УВЕЛИЧЕННЫЙ ТЕКСТ "[FREE LICENSE]" --- */}
                        {item.snapshotPrice === 0 && (
                          <span className="block text-[10px] font-semibold text-primary uppercase tracking-wide font-mono">
                            [Free License]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Link 
            href="/stash" 
            className="flex items-center justify-between w-full border border-border/60 bg-background text-foreground p-3 hover:bg-accent text-xs font-semibold uppercase tracking-wider transition-colors rounded-none group"
          >
            Open Secure Stash Matrix 
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-px transition-all" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border/40 bg-background text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          No allocated vault assets.
        </div>
      )}
    </section>
  )
}