import React from "react";
import { Cpu, HardDrive, Monitor, Zap, MemoryStick, Box, Fan, Laptop, ChevronsRight } from "lucide-react";

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
  {
    category: "Processor",
    title: "AMD Ryzen 7 9700X",
    description: "If you prioritize Photoshop/Illustrator over 3D rendering, the 9700X offers a slight bump in single-core performance for roughly the same price as the legendary 7800X3D."
  },
  {
    category: "Graphics",
    title: "Radeon RX 8800 XT 16GB",
    description: "If your workflow doesn't strictly rely on NVIDIA's CUDA cores (e.g., heavily using DaVinci Resolve over Premiere), this offers more VRAM in the exact same price tier."
  },
  {
    category: "Storage",
    title: "2TB Gen4 or 1TB Gen5 NVMe",
    description: "With SSD prices shifting in 2026, you can either double your capacity with a 2TB Gen4 drive or grab a lightning-fast 1TB Gen5 drive to eliminate After Effects cache lag for the same budget."
  }
];

export default function HardwarePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-primary opacity-10 blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24 animate-in fade-in duration-500 font-sans">
        
        <div className="mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Zap size={12} className="fill-primary" />
            Founder's Setup
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight font-display text-foreground leading-none">
            The Creator<br />
            <span className="text-muted-foreground">Workstation</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl border-l-2 border-border/60 pl-4">
            This is my personal daily driver. A curated build optimized for heavy Photoshop composites, UI/UX workflows, and video editing, wrapped in a minimalist aesthetic.
          </p>
        </div>
        <div className="mb-16">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Box size={12} /> Current Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border/50 bg-card/50 backdrop-blur-sm">
            <SpecCard icon={Cpu} label="Processor" value={MY_BUILD.cpu} />
            <SpecCard icon={Monitor} label="Graphics" value={MY_BUILD.gpu} />
            <SpecCard icon={MemoryStick} label="Memory" value={MY_BUILD.ram} />
            <SpecCard icon={HardDrive} label="Storage" value={MY_BUILD.storage} />
            
            <SpecCard icon={Box} label="Motherboard" value={MY_BUILD.motherboard} />
            <SpecCard icon={Zap} label="Power Supply" value={MY_BUILD.power} />
            <SpecCard icon={Fan} label="Cooling" value={MY_BUILD.cooling} />
            <SpecCard icon={Box} label="Chassis" value={MY_BUILD.case} />
          </div>
        </div>
        <div className="space-y-12 max-w-3xl">
          <ArticleSection title="Why this specific build?">
            <p>
              When dealing with massive files, bottlenecks are not an option. The <strong>Ryzen 7 7800X3D</strong> paired with the <strong>RTX 5070</strong> provides an incredible balance. The CPU's 3D V-Cache handles heavy viewport loads effortlessly, while the RTX 5070 unlocks blazing-fast CUDA rendering for video and AI tools.
            </p>
            <p className="mt-4">
              Everything is tied together by the new <strong>B850 chipset</strong>, providing maximum stability and PCIe bandwidth for future upgrades. The 32GB of DDR5 (6000MHz CL30) is the exact sweet spot for the AM5 platform, and the Fractal Design North case keeps the studio looking professional while the Endorfy cooler keeps it whisper-quiet.
            </p>
          </ArticleSection>
          <section className="border border-border/50 bg-background/40 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ChevronsRight className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-foreground font-display">
                Building in 2026? Make it even better
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              While my build is a rock-solid performer, hardware markets shift. If you are building a workstation today with the exact same budget, here are the tweaks I recommend to maximize your value in 2026.
            </p>
            
            <div className="space-y-4">
              {ALTERNATIVES_2026.map((alt, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-start gap-4 p-4 border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="md:w-1/4 shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{alt.category}</div>
                    <div className="font-semibold text-foreground text-sm">{alt.title}</div>
                  </div>
                  <div className="md:w-3/4 text-sm text-muted-foreground leading-relaxed">
                    {alt.description}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-border/50 my-8"></div>

          <ArticleSection title="The Mobile Node: Apple Silicon">
            <p>
              Creativity doesn't always happen at the desk. To complement the primary Windows workstation, our workflow integrates a <strong>MacBook featuring the M3 processor</strong>.
            </p>
            <div className="mt-6 p-5 border border-border/50 bg-background/50 flex flex-col sm:flex-row items-start gap-4">
              <Laptop className="w-6 h-6 text-primary shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-foreground mb-2">The Hybrid Workflow</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  The M3 MacBook is the ultimate tether-free tool. It excels in UI/UX design (Figma), vector illustrations, and client presentations. The unmatched battery life makes it the perfect companion device. We use cloud synchronization to seamlessly pass heavy rendering tasks to the desktop RTX 5070, while finalizing designs on the Mac.
                </div>
              </div>
            </div>
          </ArticleSection>
        </div>

      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 border-[0.5px] border-border/50 flex flex-col justify-between group hover:bg-accent/20 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
        <Icon size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
      <div className="font-sans text-[13px] md:text-sm text-foreground font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function ArticleSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-4 font-display">
        {title}
      </h3>
      <div className="text-muted-foreground leading-relaxed text-sm md:text-base">
        {children}
      </div>
    </section>
  );
}