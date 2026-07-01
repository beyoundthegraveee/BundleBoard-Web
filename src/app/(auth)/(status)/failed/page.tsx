import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react'

export default function FailedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-6 relative">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-background to-background pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="border border-border/60 bg-card shadow-2xl rounded-none overflow-hidden">
          
          <div className="bg-muted/30 border-b border-border/40 p-8 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-destructive/10 flex items-center justify-center mb-6 rounded-none border border-destructive/30">
              <AlertTriangle className="text-destructive w-10 h-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-2">
              Payment Failed
            </h1>
            <p className="text-xs font-medium text-destructive uppercase tracking-wider">
              Transaction Unsuccessful
            </p>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              We were unable to process your payment. This could be due to a declined card, insufficient funds, or an interrupted connection. 
              <br /><br />
              <strong className="text-foreground">No charges were made to your account.</strong>
            </p>

            <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/40 mt-4">
              <RefreshCcw size={14} className="text-muted-foreground/60" /> 
              Please review your details and try again
            </div>
          </div>

          <div className="p-4 border-t border-border/40 bg-muted/10 flex flex-col gap-3">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-3 w-full bg-foreground text-background hover:bg-foreground/90 p-4 font-bold text-xs uppercase tracking-widest transition-all duration-300 group rounded-none"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Catalog
            </Link>
          </div>
          
        </div>
        <div className="mt-8 flex justify-center items-center gap-6 text-center">
          <Link 
            href="/profile" 
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Profile Control
          </Link>
        </div>
      </div>
    </main>
  )
}