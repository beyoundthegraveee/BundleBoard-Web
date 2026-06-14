"use client"

import React from 'react'
import { ShieldCheck, Receipt } from "lucide-react"

interface BillingLedgerProps {
  purchases: any[]
  totalSpent: string
}

export function BillingLedger({ purchases, totalSpent }: BillingLedgerProps) {
  return (
    <section className="border border-border/60 bg-card p-6 rounded-none shadow-md space-y-6 font-sans text-foreground">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <Receipt size={18} className="text-primary stroke-[1.8]" />
          <h3 className="text-xl font-bold uppercase tracking-wider font-display text-foreground">
            Billing History Ledger
          </h3>
        </div>
      </div>
      
      {purchases && purchases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-sans min-w-[450px] sm:min-w-0">
            <thead>
              <tr className="border-b border-border/40 uppercase font-semibold text-muted-foreground tracking-wider">
                <th className="pb-3">Date</th>
                {/* Заменили Reference ID на Status / Details */}
                <th className="pb-3 text-center">Status / Details</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="font-medium text-foreground uppercase tracking-wide">
              {purchases.map((p: any, index: number) => (
                <tr key={p.id || index} className="border-b border-border/10 last:border-0 text-xs hover:bg-muted/10 transition-colors">
                  <td className="py-3.5 font-semibold">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  {/* Выводим статус и количество ассетов */}
                  <td className="py-3.5 text-center">
                    <div className="flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {p.status || 'PROCESSED'}
                      </span>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">
                        {p.items?.length || 0} NODES ACQUIRED
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-bold text-foreground font-mono">
                    {Number(p.amount || 0) === 0 ? "FREE" : `${Number(p.amount).toFixed(2)} ${p.currency}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border/40 bg-background text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          No transactional entries recorded on this node.
        </div>
      )}
      <div className="pt-4 border-t border-border/40 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck size={14} className="text-primary" /> Gateway Verified
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">
            Total Value Processed
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">
            {totalSpent === "0.00" ? "FREE" : `${totalSpent} ${purchases?.[0]?.currency || "USD"}`}
          </span>
        </div>
      </div>

    </section>
  )
}