import Link from 'next/link'
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export default async function SuccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-6 relative">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="border border-border/60 bg-card shadow-2xl rounded-none overflow-hidden">

          <div className="bg-muted/30 border-b border-border/40 p-8 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-primary/10 flex items-center justify-center mb-6 rounded-none border border-primary/20">
              <CheckCircle className="text-primary w-10 h-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-2">
              Payment Confirmed
            </h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Transaction Successful
            </p>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Your digital assets have been successfully added to your vault. A detailed receipt has been sent to your registered email address.
            </p>

            <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              <ShieldCheck size={14} className="text-primary" /> 
              Secure Checkout Verified
            </div>
          </div>

          <div className="p-4 border-t border-border/40 bg-muted/10">
            <Link 
              href="/stash" 
              className="flex items-center justify-center gap-3 w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground p-4 font-bold text-xs uppercase tracking-widest transition-all duration-300 group rounded-none"
            >
              Access Your Stash
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  )
}