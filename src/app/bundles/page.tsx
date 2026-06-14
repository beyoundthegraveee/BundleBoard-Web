"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { SortCollectionGrid } from '@/components/SortCollectionGrid';
import { SortSidebar } from '@/components/SortSidebar';

export default function BundlesPage() {
  const [activeSort, setActiveSort] = useState("newest");
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
          
          <SortSidebar 
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            activeFormats={activeFormats}
            toggleFormat={toggleFormat}
          />
          
          <div className="flex-1 w-full min-w-0">
            <SortCollectionGrid sortBy={activeSort} mimeTypes={activeFormats} />
          </div>
          
        </div>
      </div>
    </main>
  );
}