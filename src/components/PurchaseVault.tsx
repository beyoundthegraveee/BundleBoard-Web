"use client"

import React from 'react'
import Link from 'next/link'
import { FolderLock, ExternalLink, AlertTriangle } from "lucide-react"
import { FALLBACK_IMAGE } from '@/lib/constants'

interface PurchasedVaultProps {
  purchases: any[]
  totalAssetsCount: number
}

export function PurchasedVault({ purchases, totalAssetsCount }: PurchasedVaultProps) {
  const previewItems = React.useMemo(() => {
    if (!purchases) return []
    return purchases
      .flatMap(p => (p.items || []).map((item: any) => ({ ...item, pStatus: p.status })))
      .slice(0, 3)
  }, [purchases])

  return (
    <section className="border border-border/60 bg-card p-6 rounded-none shadow-md space-y-6 font-sans text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <FolderLock size={18} className="text-primary stroke-[1.8]" />
          <h3 className="text-xl font-bold uppercase tracking-wider font-display text-foreground">
            Core Vault Directory
          </h3>
        </div>
        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 border border-border/40 text-muted-foreground font-mono rounded-none tracking-wider">
          {totalAssetsCount} NODES
        </span>
      </div>

      {totalAssetsCount > 0 ? (
        <div className="space-y-4">
          {/* Компактный список-превью высокой плотности */}
          <div className="divide-y divide-border/20 border-b border-border/20">
            {previewItems.map((item: any, idx: number) => {
              if (!item.asset) {
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

              return (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-background border border-border/40 shrink-0 overflow-hidden">
                      <img 
                        src={item.asset.previewImage?.filePath || FALLBACK_IMAGE} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80" 
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
                        {item.asset.name}
                      </h4>
                      <span className="block text-[8px] text-muted-foreground uppercase tracking-wide font-mono">
                        Status // {item.pStatus}
                      </span>
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
            <ExternalLink size={13} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-px transition-all" />
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