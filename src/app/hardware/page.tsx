import React from "react";
import { Monitor, Cpu, Mouse, Keyboard } from "lucide-react";

export const metadata = {
  title: "Hardware Setup | BundleBoard",
  description: "Gear recommendations for design professionals.",
};

const HARDWARE_CATEGORIES = [
  {
    icon: Monitor,
    title: "Displays & Monitors",
    description: "Color accuracy is non-negotiable. Explore our top picks for 4K panels with 100% sRGB and DCI-P3 coverage.",
  },
  {
    icon: Cpu,
    title: "Workstations",
    description: "From M-series Macs for seamless UI design to custom PC builds optimized for heavy 3D rendering in Blender.",
  },
  {
    icon: Mouse,
    title: "Peripherals",
    description: "Ergonomic mice, drawing tablets, and tools designed to prevent fatigue during long creative sessions.",
  },
  {
    icon: Keyboard,
    title: "Mechanical Keyboards",
    description: "Tactile feedback and custom macro setups to speed up your workflow and shortcut execution.",
  },
];

export default function HardwarePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 animate-in fade-in duration-500">
      <div className="max-w-3xl mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight font-display">
          Hardware Setup
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Your software is only as good as the hardware running it. Discover our curated recommendations for building the ultimate workspace tailored for digital design, 3D modeling, and motion graphics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HARDWARE_CATEGORIES.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div 
              key={idx} 
              className="border border-border/50 bg-card p-8 hover:bg-accent/40 transition-colors rounded-none space-y-4 cursor-default group"
            >
              <div className="w-12 h-12 bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
                <Icon strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              
              <div className="pt-4 mt-auto">
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors flex items-center gap-2">
                  View Guide &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}