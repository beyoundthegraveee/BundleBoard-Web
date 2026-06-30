import React from "react";
import { Cpu, HardDrive, Monitor, Zap, MemoryStick, Box, Fan, Laptop, ChevronsRight, LucideIcon} from "lucide-react";
import WaveBackground from '@/components/backgrounds/WaveBackground';

export const metadata = {
  title: "Hardware Setup | BundleBoard",
  description: "My personal workstation build and 2026 recommendations.",
};

const MY_BUILD = {
  cpu: "AMD Ryzen 7 7800X3D",
  gpu: "NVIDIA GeForce RTX 5070",
  ram: "32GB DDR5 6000MHz CL30",
  storage: "1TB Lexar NM790 Gen4 NVMe",
  motherboard: "MSI B850 Gaming Plus WiFi",
  power: "Endorfy Supremo FM5 750W Gold",
  cooling: "Endorfy Fortis 5",
  case: "Fractal Design North (Charcoal Black)",
};

const ALTERNATIVES_2026 = [
  { category: "Processor", title: "AMD Ryzen 7 9700X", description: "If you prioritize Photoshop/Illustrator over 3D rendering, the 9700X offers a slight bump in single-core performance." },
  { category: "Graphics", title: "Radeon RX 8800 XT 16GB", description: "More VRAM in the same price tier if your workflow isn't strictly CUDA-dependent." },
  { category: "Storage", title: "2TB Gen4 / 1TB Gen5 NVMe", description: "Double capacity with 2TB Gen4 or eliminate After Effects cache lag with a Gen5 drive." }
];

export default function HardwarePage() {
  return (
    <div className="relative min-h-screen">
      <WaveBackground color1="#8b5cf6" color2="#3b82f6" color3="#0ea5e9" distortion={0.06} />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-24 animate-in fade-in duration-500 font-sans relative z-10">
        
        <header className="mb-12 md:mb-16 space-y-4 md:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight font-display text-foreground leading-none">
            The Creator <br /><span className="text-muted-foreground">Workstation</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-2xl border-l-2 border-border/60 pl-4">
            Curated build optimized for heavy Photoshop composites, UI/UX workflows, and video editing, wrapped in a minimalist aesthetic.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Box size={12} /> Current Configuration
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border/50 bg-card/50 backdrop-blur-sm">
            <SpecCard icon={Cpu} label="Processor" value={MY_BUILD.cpu} />
            <SpecCard icon={Monitor} label="Graphics" value={MY_BUILD.gpu} />
            <SpecCard icon={MemoryStick} label="Memory" value={MY_BUILD.ram} />
            <SpecCard icon={HardDrive} label="Storage" value={MY_BUILD.storage} />
            <SpecCard icon={Box} label="Motherboard" value={MY_BUILD.motherboard} />
            <SpecCard icon={Zap} label="Power Supply" value={MY_BUILD.power} />
            <SpecCard icon={Fan} label="Cooling" value={MY_BUILD.cooling} />
            <SpecCard icon={Box} label="Chassis" value={MY_BUILD.case} />
          </div>
        </section>

        <div className="space-y-12">
          <article className="max-w-3xl">
            <h3 className="text-base md:text-lg font-bold uppercase tracking-tight text-foreground mb-4 font-display">Why this specific build?</h3>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed">
              <p>When dealing with massive files, bottlenecks are not an option. The <strong>Ryzen 7 7800X3D</strong> handles heavy viewport loads effortlessly, while the <strong>RTX 5070</strong> unlocks blazing-fast rendering.</p>
            </div>
          </article>

          <section className="border border-border/50 bg-background/40 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ChevronsRight className="w-5 h-5 text-primary" />
              <h3 className="text-base md:text-xl font-bold uppercase tracking-tight text-foreground font-display">Building in 2026?</h3>
            </div>
            <div className="space-y-4">
              {ALTERNATIVES_2026.map((alt, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 border border-border/30 bg-muted/10">
                  <div className="sm:w-1/3 shrink-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">{alt.category}</div>
                    <div className="font-semibold text-foreground text-xs">{alt.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{alt.description}</div>
                </div>
              ))}
            </div>
          </section>

          <article className="max-w-3xl pt-8 border-t border-border/20">
            <h3 className="text-base md:text-lg font-bold uppercase tracking-tight text-foreground mb-4 font-display">The Mobile</h3>
            <div className="p-5 border border-border/50 bg-background/50 flex items-start gap-4">
              <Laptop className="w-6 h-6 text-primary shrink-0 mt-1" strokeWidth={1.5} />
              <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground block mb-1">M3 MacBook Workflow</span>
                Our studio integrates a MacBook M3 for Figma, vectors, and presentations. Cloud sync seamlessly bridges the gap between this and the desktop powerhouse.
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

function SpecCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: LucideIcon,
  label: string, 
  value: string 
}) {
  return (
    <div className="p-4 md:p-6 border-[0.5px] border-border/50 flex flex-col justify-between group hover:bg-accent/20 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon size={12} className="text-muted-foreground/50" />
      </div>
      <div className="text-[11px] sm:text-[12px] text-foreground font-semibold tracking-tight leading-tight">
        {value}
      </div>
    </div>
  );
}