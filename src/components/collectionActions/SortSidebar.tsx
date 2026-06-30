"use client"

import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';

interface SortSidebarProps {
  activeSort: string;
  setActiveSort: (id: string) => void;
  activeFormats: string[];
  toggleFormat: (format: string) => void;
}

export function SortSidebar({ 
  activeSort, setActiveSort, 
  activeFormats, toggleFormat 
}: SortSidebarProps) {
  
  const fileFormats = ["jpeg", "png", "mp4", "zip", "rar", "pdf"];

  return (
    <aside className="w-full lg:w-[240px] flex-shrink-0 space-y-10 sticky top-28 self-start">

      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border pb-3">
          <SlidersHorizontal size={14} className="text-primary" />
          Sort Parameters
        </h3>
        <div className="flex flex-col gap-4 pt-2">
          {[
            { id: "newest", label: "Latest Init" },
            { id: "oldest", label: "Date: Oldest" },
            { id: "likes", label: "Top Rated" },
            { id: "author-rating", label: "Top Creators" },
            { id: "size-asc", label: "Size: Lightest First" },
            { id: "alpha", label: "Alphabetical" },
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-3 group cursor-pointer select-none">
              <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors rounded-none ${activeSort === option.id ? 'border-primary bg-primary/20' : 'border-border group-hover:border-foreground/30'}`}>
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
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] border-b border-border pb-3">
          File Matrix
        </h3>
        <div className="flex flex-col gap-4 pt-2">
          {fileFormats.map((format) => {
            const isActive = activeFormats.includes(format);
            return (
              <label key={format} className="flex items-center gap-3 group cursor-pointer select-none">
                <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors rounded-none ${isActive ? 'border-primary bg-primary' : 'border-border group-hover:border-foreground/30'}`}>
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
  );
}