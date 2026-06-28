"use client"

import { CollectionGrid } from "@/components/CollectionGrid";
import { HighestRatedCarousel } from "@/components/HighestRatedCarousel";
import { ArrowRight, Activity, Grid3X3, ExternalLink, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="min-h-screen bg-background text-foreground antialiased font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="w-full bg-foreground text-background py-2.5 border-b border-border/10 relative z-10 text-[9px] sm:text-[11px] font-medium uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center sm:justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-primary animate-pulse rounded-none" />
            <span className="font-semibold tracking-widest text-center">System Status: Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 opacity-60 tracking-widest">
            <span>Data Stream: Encrypted</span>
            <span>Node: 2.0.26</span>
          </div>
        </div>
      </div>

      <section className="relative border-b border-border/60 pt-20 md:pt-28 pb-16 md:pb-24 bg-background/50 backdrop-blur-sm onyx-glow overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="absolute -top-4 -left-1 w-1.5 h-1.5 bg-foreground" />
          <div className="absolute -top-4 -right-1 w-1.5 h-1.5 bg-foreground" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0">
            <div className="lg:col-span-8 space-y-5 md:space-y-6 lg:pr-16">
              <div className="inline-flex items-center gap-2 border border-border/80 px-3 py-1 bg-card/40 text-foreground text-[10px] md:text-[11px] font-semibold uppercase tracking-wider rounded-none">
                <Activity size={12} className="text-primary" />
                <span>Asset Deployment</span>
              </div>
              
              <h1 className="text-[2.75rem] leading-none sm:text-6xl md:text-[5.5rem] font-bold tracking-tight md:leading-[0.95] uppercase break-words">
                <span className="text-foreground">Curated Supply</span> <br />
                <span 
                  className="font-black text-transparent" 
                  style={{ WebkitTextStroke: '2px var(--foreground)' }}
                >
                  Intelligent Data.
                </span>
              </h1>
              
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xl leading-relaxed pt-2 md:pt-4 font-normal">
                Unlock high-fidelity digital assets, custom vector graphs, and production-grade gradients optimized to enhance professional studio processing pipelines.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/60 pt-8 lg:pt-0 lg:pl-12 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2.5">
                  <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Network Link</span>
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-wide">99.99% UP</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2.5">
                  <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Distribution</span>
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-wide">EU CLUSTER</span>
                </div>
              </div>
              
              <div className="mt-8 lg:mt-auto pt-6 border-t border-dashed border-border/60">
                <p className="text-[10px] md:text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wide font-normal">
                  <span className="font-bold text-foreground">Warning:</span> Asset nodes require modern compute capabilities. Unauthorized mirroring or data mining is heavily prohibited by distribution policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16 border-b border-white/5 z-10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 mb-6 md:mb-10 flex items-center justify-between relative">
          <div className="flex items-center gap-2 md:gap-3">
            <Heart size={14} className="text-primary" />
            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-foreground">Highest Rated</h2>
          </div>
          <span className="text-[9px] md:text-[10px] font-medium opacity-40 tracking-widest uppercase hidden sm:block">Community Verified / Auto-Scroll</span>
        </div>
        <HighestRatedCarousel />
      </section>

      <section className="relative py-12 md:py-16 border-t border-white/5 z-10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 mb-6 md:mb-10 flex items-center justify-between relative">
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-foreground" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-foreground" />
          
          <div className="flex items-center gap-2 md:gap-3">
            <Grid3X3 size={14} className="text-primary" />
            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-foreground truncate max-w-[200px] sm:max-w-none">Active Inventory Directory</h2>
          </div>
          <span className="text-[9px] md:text-[10px] font-medium opacity-40 tracking-widest uppercase shrink-0">Stream Vol 001</span>
        </div>
        
        <CollectionGrid />
        
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 mt-8 md:mt-12 flex justify-center">
          <Link 
            href="/bundles" 
            className="group flex w-full sm:w-auto justify-center items-center gap-3 border border-border/60 bg-background/50 px-6 sm:px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300 backdrop-blur-sm"
          >
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-center">Access Full Directory</span>
            <ArrowRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="bg-foreground text-background pt-12 md:pt-20 pb-8 md:pb-12 relative z-20 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
            
            <div className="sm:col-span-2 space-y-4">
              <div className="text-sm font-bold tracking-[0.25em] text-background uppercase">
                BUNDLE<span className="opacity-40">BOARD</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-background text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Directory</span>
              <Link href="/bundles" className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-background/50 hover:text-background transition-colors">
                Global Catalog
              </Link>
              <Link href="/terms" className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-background/50 hover:text-background transition-colors">
                Terms of Service
              </Link>
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-background text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Protocols</span>
              <a href="mailto:bundleboard@gmail.com" className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-background/50 hover:text-background transition-colors inline-flex items-center gap-1">
                Support Node <ExternalLink size={10} className="opacity-40" />
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-start items-center border-t border-background/10 pt-6 md:pt-8 text-[9px] md:text-[10px] text-background/40 tracking-widest uppercase font-medium">
            <span className="text-center md:text-left">© 2026 BundleBoard. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}