import React from 'react';
import { Coffee, ExternalLink } from "lucide-react";
import { BuyMeCoffeeLink } from '@/lib/constants';

export default function BmacBanner() {
  return (
    <a
      href={BuyMeCoffeeLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/40 bg-card/20 p-5 transition-all duration-300 hover:bg-muted/10 hover:border-[#FFDD00]/50 rounded-none relative overflow-hidden w-full cursor-pointer mt-6"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#FFDD00] opacity-80 group-hover:w-1.5 transition-all duration-300" />

      <div className="flex items-center gap-4 z-10 pl-2">
        <div className="bg-[#FFDD00]/10 p-3 border border-[#FFDD00]/20 rounded-none group-hover:scale-110 transition-transform duration-300">
          <Coffee size={20} className="text-[#FFDD00]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Support the Platform
          </span>
          <span className="text-sm font-bold text-foreground group-hover:text-[#FFDD00] transition-colors">
            Buy BundleBoard a Coffee
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors shrink-0 z-10">
        Send Support <ExternalLink size={12} />
      </div>
    </a>
  );
}