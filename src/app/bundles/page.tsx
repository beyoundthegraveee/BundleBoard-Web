"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { SortCollectionGrid } from '@/components/collection/grid/SortCollectionGrid';
import { SortSidebar } from '@/components/collection/details/page/SortSidebar';
import { BackgroundGradient } from '@/components/backgrounds/BackgroundGradient';
import { ChevronDown, Filter } from 'lucide-react';

export default function BundlesPage() {
  const [activeSort, setActiveSort] = useState("newest");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleFormat = (format: string) => {
    setActiveFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  return (
    <main className="relative min-h-screen">
      <BackgroundGradient />
      
      <div className="p-4 md:p-12 font-sans animate-in fade-in duration-300">
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10">
          
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
            <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
            <span className="opacity-30">/</span>
            <span className="text-primary">Bundles</span>
          </div>
          
          <header className="border-b border-border pb-4 md:pb-6">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
              Directory // Global
            </h1>
          </header>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden flex w-full items-center justify-between border border-border bg-card p-3 text-[10px] font-bold uppercase tracking-widest"
          >
            <span className="flex items-center gap-2">
              <Filter size={12} /> Filter Parameters
            </span>
            <ChevronDown size={12} className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
              <SortSidebar 
                activeSort={activeSort}
                setActiveSort={setActiveSort}
                activeFormats={activeFormats}
                toggleFormat={toggleFormat}
              />
            </div>
            
            <div className="flex-1 w-full min-w-0">
              <SortCollectionGrid sortBy={activeSort} mimeTypes={activeFormats} />
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}