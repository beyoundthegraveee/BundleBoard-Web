"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Check } from 'lucide-react';
import { CollectionGrid } from '@/components/CollectionGrid';

export default function BundlesPage() {
  const [activeSort, setActiveSort] = useState("newest");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const toggleFormat = (format: string) => {
    setActiveFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-primary">Bundles</span>
          <span className="opacity-30">/</span>
          <span className="text-foreground">Global Directory</span>
        </div>
        <header className="border-b border-white/[0.06] pb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
            Directory // Global
          </h1>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
            Displaying complete index mapping matrices with active filters.
          </p>
        </header>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <aside className="w-full lg:w-[240px] flex-shrink-0 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <SlidersHorizontal size={14} className="text-primary" />
                Sort Parameters
              </h3>
              <div className="flex flex-col gap-4 pt-2">
                {[
                  { id: "newest", label: "Latest Init" },
                  { id: "popular", label: "High Traffic" },
                  { id: "price-low", label: "Cost: Ascending" },
                  { id: "price-high", label: "Cost: Descending" },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3 group cursor-pointer select-none">
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors rounded-none ${activeSort === option.id ? 'border-primary bg-primary/20' : 'border-white/[0.15] group-hover:border-white/[0.3]'}`}>
                      {activeSort === option.id && <div className="w-1.5 h-1.5 bg-primary rounded-none" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider ${activeSort === option.id ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                      {option.label}
                    </span>
                    <input type="radio" name="sort" value={option.id} className="hidden" onChange={() => setActiveSort(option.id)} />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] border-b border-white/[0.06] pb-3">
                Licensing
              </h3>
              <div className="pt-2">
                <label className="flex items-center gap-3 group cursor-pointer select-none">
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors rounded-none ${showFreeOnly ? 'border-primary bg-primary' : 'border-white/[0.15] group-hover:border-white/[0.3]'}`}>
                    {showFreeOnly && <Check size={10} className="text-primary-foreground stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider ${showFreeOnly ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                    Free Nodes Only
                  </span>
                  <input type="checkbox" className="hidden" checked={showFreeOnly} onChange={() => setShowFreeOnly(!showFreeOnly)} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] border-b border-white/[0.06] pb-3">
                File Matrix
              </h3>
              <div className="flex flex-col gap-4 pt-2">
                {["ZIP", "Figma", "PSD", "Blend", "SVG"].map((format) => {
                  const isActive = activeFormats.includes(format);
                  return (
                    <label key={format} className="flex items-center gap-3 group cursor-pointer select-none">
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors rounded-none ${isActive ? 'border-primary bg-primary' : 'border-white/[0.15] group-hover:border-white/[0.3]'}`}>
                        {isActive && <Check size={10} className="text-primary-foreground stroke-[3]" />}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                        .{format}
                      </span>
                      <input type="checkbox" className="hidden" checked={isActive} onChange={() => toggleFormat(format)} />
                    </label>
                  );
                })}
              </div>
            </div>

          </aside>
          <div className="flex-1 w-full min-w-0">
            <CollectionGrid />
          </div>
          
        </div>
      </div>
    </main>
  );
}