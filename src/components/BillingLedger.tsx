import React from 'react'
import { ShieldCheck } from "lucide-react"

export function BillingLedger({ purchases, totalSpent }: { purchases: any[], totalSpent: string }) {
  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center gap-4 opacity-50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing History Ledger</h3>
        <div className="flex-1 border-b border-border/40 border-dashed" />
      </div>
      
      <div className="bg-card border border-border/40 p-5 rounded-none shadow-sm">
        <table className="w-full text-left text-[11px] font-sans">
          <thead>
            <tr className="border-b border-border/40 uppercase font-semibold text-muted-foreground tracking-wider">
              <th className="pb-2">Date</th>
              <th className="pb-2 text-center">Reference ID</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="font-medium text-foreground uppercase tracking-wide">
            {purchases?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/20 last:border-0 text-xs">
                <td className="py-3.5 font-semibold">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="py-3.5 text-center text-[11px] text-muted-foreground opacity-60">#{p.id.slice(0, 8)}</td>
                <td className="py-3.5 text-right font-bold text-foreground">{p.amount.toFixed(2)} {p.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck size={14} className="text-primary" /> Gateway Verified
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Total Value Processed</span>
            <span className="text-xl font-bold tracking-tight text-foreground">{totalSpent} {purchases?.[0]?.currency || "USD"}</span>
          </div>
        </div>
      </div>
    </section>
  )
}