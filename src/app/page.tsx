"use client"

import { CollectionGrid } from "@/components/CollectionGrid";
import { ArrowRight, Activity, Grid3X3, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
// Импортируем наши стилизованные коробки
import { Boxes } from "@/components/ui/background-boxes";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="min-h-screen bg-background text-foreground antialiased font-sans">

      {/* Глобальная статическая сетка (оставляем для структуры нижних блоков) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Верхний статус-бар */}
      <div className="w-full bg-foreground text-background py-2.5 border-b border-border/10 relative z-10 text-[11px] font-medium uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-primary animate-pulse rounded-none" />
            <span className="font-semibold tracking-widest">System Status: Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 opacity-60 tracking-widest">
            <span>Data Stream: Encrypted</span>
            <span>Node: 2.0.26</span>
          </div>
        </div>
      </div>

      {/* HERO СЕКЦИЯ: Добавили overflow-hidden, чтобы сетка не ломала верстку */}
      <section className="relative border-b border-border/60 pt-28 pb-24 bg-background/50 backdrop-blur-sm onyx-glow overflow-hidden">
        
        {/* Вставляем интерактивные коробки на задний план секции */}
        <Boxes />

        {/* Контент-контейнер: Добавили z-10, чтобы текст был поверх коробок и оставался читаемым */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          <div className="absolute -top-4 -left-1 w-1.5 h-1.5 bg-foreground" />
          <div className="absolute -top-4 -right-1 w-1.5 h-1.5 bg-foreground" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
            
            <div className="lg:col-span-8 space-y-6 lg:pr-16">
              <div className="inline-flex items-center gap-2 border border-border/80 px-3 py-1 bg-card/40 text-foreground text-[11px] font-semibold uppercase tracking-wider rounded-none">
                <Activity size={12} className="text-primary" />
                <span>Asset Deployment Protocol</span>
              </div>
              
              <h1 className="text-4xl md:text-[5.5rem] font-bold tracking-tight leading-[0.95] uppercase text-foreground">
                Curated Supply <br />
                <span className="font-light opacity-50">Intelligent Data.</span>
              </h1>
              
              <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed pt-4 font-normal">
                Unlock high-fidelity digital assets, custom vector graphs, and production-grade gradients optimized to enhance professional studio processing pipelines.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/60 pt-8 lg:pt-0 lg:pl-12 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Network Link</span>
                  <span className="text-xs font-bold uppercase tracking-wide">99.99% UP</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Distribution</span>
                  <span className="text-xs font-bold uppercase tracking-wide">EU CLUSTER</span>
                </div>
                
                {status !== "authenticated" && (
                  <div className="pt-6">
                    <button className="group w-full h-12 bg-foreground text-background hover:bg-primary hover:text-white flex items-center justify-center gap-2 font-semibold transition-all duration-200 text-xs uppercase tracking-widest rounded-none">
                      Initialize Registry 
                      <ArrowRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-12 lg:mt-auto pt-6 border-t border-dashed border-border/60">
                <p className="text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wide font-normal">
                  <span className="font-bold text-foreground">Warning:</span> Asset nodes require modern compute capabilities. Unauthorized mirroring or data mining is heavily prohibited by distribution policy.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Секция инвентаря */}
      <section className="relative py-20 border-t border-white/5 z-10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-16 flex items-center justify-between relative">
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-foreground" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-foreground" />
          
          <div className="flex items-center gap-3">
            <Grid3X3 size={14} className="text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-foreground">Active Inventory Directory</h2>
          </div>
          <span className="text-[10px] font-medium opacity-40 tracking-widest uppercase">Stream Vol 001</span>
        </div>

        <CollectionGrid />
      </section>

      {/* Футер сайта */}
      <footer className="bg-foreground text-background pt-20 pb-12 relative z-20 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            
            <div className="md:col-span-2 space-y-4">
              <div className="text-sm font-bold tracking-[0.25em] text-background uppercase">
                BUNDLE<span className="opacity-40">BOARD</span>
              </div>
              <p className="text-background/60 text-xs max-w-sm leading-relaxed uppercase tracking-wider font-normal">
                Developing professional utility interface nodes and secure file delivery streams. Engineered for agencies, digital product designers, and technical artists.
              </p>
            </div>
            
            {['Directory', 'Protocols'].map((title, i) => (
              <div key={title} className="flex flex-col gap-3">
                <span className="text-background text-xs font-bold uppercase tracking-wider mb-1">{title}</span>
                <a className="text-[11px] font-medium uppercase tracking-wider text-background/50 hover:text-background transition-colors inline-flex items-center gap-1 cursor-pointer">
                  {i === 0 ? "Global Catalog" : "Developer Manifest"} <ExternalLink size={10} className="opacity-40" />
                </a>
                <a className="text-[11px] font-medium uppercase tracking-wider text-background/50 hover:text-background transition-colors inline-flex items-center gap-1 cursor-pointer">
                  {i === 0 ? "License Framework" : "Encryption Architecture"} <ExternalLink size={10} className="opacity-40" />
                </a>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-background/10 pt-8 gap-4 text-[10px] text-background/40 tracking-widest uppercase font-medium">
            <span>Core Node: 52.2297° N, 21.0122° E</span>
            <div className="flex gap-8 items-center">
              <span className="hover:text-background transition-colors cursor-pointer">Privacy Protocol</span>
              <span>© 2026 BundleBoard. Storage encrypted.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}