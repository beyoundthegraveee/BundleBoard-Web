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
    <section className="border border-border/60 bg-card p-4 rounded-none shadow-md space-y-4 font-sans text-foreground">
      <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
          <FolderLock size={12} className="text-primary" /> Core Vault Directory
        </div>
        <span className="text-[9px] font-bold bg-muted px-1.5 py-0.5 border border-border/40 text-muted-foreground font-mono">
          {totalAssetsCount} NODES
        </span>
      </div>

      {totalAssetsCount > 0 ? (
        <div className="space-y-2">
          {/* Компактный список-превью высокой плотности */}
          <div className="divide-y divide-border/20 border-b border-border/20">
            {previewItems.map((item: any, idx: number) => {
              if (!item.asset) {
                return (
                  <div key={item.id || idx} className="py-2.5 flex items-center gap-3 opacity-60">
                    <div className="w-8 h-8 bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                      <AlertTriangle size={12} className="text-destructive" />
                    </div>
                    <div className="min-w-0 flex-1 text-[11px] font-medium text-destructive uppercase tracking-tight">Offline Node</div>
                  </div>
                )
              }

              return (
                <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-background border border-border/40 shrink-0 overflow-hidden">
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
        <div className="text-center py-6 border border-dashed border-border/40 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          No allocated vault assets.
        </div>
      )}
    </section>
  )
}