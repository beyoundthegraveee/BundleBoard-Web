import React from 'react'
import Link from 'next/link'
import { Download, AlertTriangle } from "lucide-react"
import LikeButton from '@/components/LikeButton'
import { FALLBACK_IMAGE } from '@/lib/constants'

export function PurchasedVault({ purchases, totalAssetsCount }: { purchases: any[], totalAssetsCount: number }) {
  return (
    <section className="space-y-6 flex flex-col">
      <div className="flex items-center gap-4 border-b border-border/40 pb-3 shrink-0">
        <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">Purchased Core Vault</h3>
        <div className="flex-1" />
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-muted text-muted-foreground border border-border/40">
          {totalAssetsCount} Assets
        </span>
      </div>

      {totalAssetsCount > 0 ? (
        <div className="max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
            {purchases?.map((purchase) => (
              <React.Fragment key={purchase.id}>
                {purchase.items?.map((item: any) => {
                  if (!item.asset) {
                    return (
                      <div key={item.id} className="border border-dashed border-destructive/40 bg-destructive/5 rounded-none shadow-sm flex flex-col justify-center items-center relative aspect-square sm:aspect-auto p-6 text-center">
                        <AlertTriangle size={24} className="text-destructive/60 mb-3" />
                        <div className="text-destructive font-bold uppercase tracking-wider text-[11px] mb-1">Asset Offline</div>
                        <div className="text-muted-foreground text-[9px] uppercase tracking-widest">Node destroyed by author</div>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="group border border-border/40 bg-card rounded-none shadow-sm overflow-hidden flex flex-col justify-between relative">
                      <div className="aspect-video border-b border-border/30 overflow-hidden bg-muted relative">
                        <img 
                          src={item.asset.previewImage?.filePath || FALLBACK_IMAGE} 
                          alt={item.asset.name} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <LikeButton collectionId={item.asset.id} />
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-bold uppercase text-xs text-foreground tracking-tight leading-snug line-clamp-1">{item.asset.name}</span>
                          <div className="text-[9px] bg-muted border border-border/60 px-1.5 py-0.5 font-semibold uppercase text-muted-foreground tracking-wider shrink-0">
                            {purchase.status}
                          </div>
                        </div>
                        <Link href={`/assets/${item.asset.id}`} className="flex items-center justify-center gap-2 w-full bg-foreground text-background hover:bg-primary hover:text-white p-2.5 font-bold text-[10px] uppercase tracking-widest transition-colors rounded-none">
                          <Download size={12} /> Download
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border/60 p-16 text-center bg-card/20">
          <div className="font-semibold uppercase text-muted-foreground/40 text-sm tracking-widest mb-4">Storage Directory Empty</div>
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[11px] uppercase border border-border/80 px-4 py-2 bg-background hover:bg-accent tracking-wider transition-colors rounded-none">
            Browse Active Catalog
          </Link>
        </div>
      )}
    </section>
  )
}