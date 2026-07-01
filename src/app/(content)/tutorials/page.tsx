import React from "react";
import { PlayCircle, Clock, Zap } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Tutorials | BundleBoard",
  description: "Learn how to use your digital assets with our comprehensive video guides.",
};

const YOUTUBE_TUTORIALS = [
  { id: 1, youtubeId: "NjJmlooCxwI", title: "3D Chrome Photoshop Tutorial (+ FREE TEMPLATE)", category: "Photoshop", duration: "15:01" },
  { id: 2, youtubeId: "sFqEMZ-RVL4", title: "Iridescent Chrome Text Effect in Photoshop", category: "Photoshop", duration: "22:07" },
  { id: 3, youtubeId: "XLOwAihsftE", title: "Mastering The Mograph Edit Style (Easy) | After Effects Tutorial", category: "After Effects", duration: "8:11" },
  { id: 4, youtubeId: "EtZalJhwzVs", title: "Animate After Effects Camera Like A Pro | Only Video You Need |", category: "After Effects", duration: "13:16" },
  { id: 5, youtubeId: "7tSB67Y1CqU", title: "How to make a MOCKUP for your CLOTHING BRAND", category: "Photoshop", duration: "12:13" },
  { id: 6, youtubeId: "WFkGbyH24AY", title: "How A Graphic Designer MUST Think in 2026 To Survive!", category: "Design", duration: "12:14" },
  { id: 7, youtubeId: "Xy3Rg6XowC8", title: "How to Add Textures to Your Designs | Photoshop Tutorial + Free Download", category: "Photoshop", duration: "9:21" },
  { id: 8, youtubeId: "QdoK1aFPL7Y", title: "How I Made This INSANE Brutalism Poster! (Photoshop Tutorial)", category: "Photoshop", duration: "7:16" },
  { id: 9, youtubeId: "COMgLMYOX8k", title: "24 FREE Fonts That Feel Expensive (Must Download)", category: "Photoshop", duration: "8:31" },
  { id: 10, youtubeId: "AXpxZMRM1EY", title: "The ULTIMATE Guide To Typography For Beginners", category: "Typography", duration: "13:29" },
  { id: 11, youtubeId: "xmYkXNkv2GE", title: "GRADIENT MAPS for adding color?! (you'll never recover)", category: "Photoshop", duration: "6:32" },
  { id: 12, youtubeId: "uZWnxa4mkKA", title: "15 More Design Styles You've Never Heard Of", category: "Design", duration: "22:24" },
];

export default function TutorialsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-12 md:py-24 animate-in fade-in duration-500 font-sans">

        <div className="max-w-3xl mb-12 md:mb-16 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <Zap size={10} className="fill-primary" />
            Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tight font-display text-foreground leading-none">
            Video <span className="text-muted-foreground">Tutorials</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg leading-relaxed border-l-2 border-border/60 pl-4">
            Level up your creative workflow. Learn how to extract maximum value from BundleBoard assets, master new software tools, and streamline your entire process.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
          {YOUTUBE_TUTORIALS.map((tutorial) => (
            <a 
              key={tutorial.id} 
              href={`https://www.youtube.com/watch?v=${tutorial.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col border border-border/50 bg-card hover:border-primary transition-all duration-300 rounded-none overflow-hidden shadow-sm hover:shadow-primary/5"
            >
              <div className="aspect-video bg-[#111013] relative flex items-center justify-center overflow-hidden border-b border-border/20">
                <Image 
                  src={`https://img.youtube.com/vi/${tutorial.youtubeId}/maxresdefault.jpg`} 
                  alt={tutorial.title} 
                  fill
                  unoptimized
                  className="object-cover w-full h-full opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                
                <PlayCircle 
                  className="absolute w-8 h-8 md:w-14 md:h-14 text-white/50 group-hover:text-primary group-hover:scale-110 transition-all duration-300 drop-shadow-2xl" 
                  strokeWidth={1.2} 
                />
                
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-background/80 backdrop-blur-md px-1.5 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-foreground border border-white/10">
                  {tutorial.category}
                </div>
                
                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-background/80 backdrop-blur-md px-1.5 md:px-2 py-0.5 md:py-1 text-[8px] md:text-[10px] font-bold tracking-widest text-foreground flex items-center gap-1 border border-white/10">
                  <Clock className="w-2.5 h-2.5" strokeWidth={2} /> 
                  <span className="mt-px">{tutorial.duration}</span>
                </div>
              </div>
              
              <div className="p-3 md:p-6 flex flex-col flex-1 justify-between gap-2 md:gap-4 bg-card/40 backdrop-blur-sm">
                <h3 className="font-bold text-[11px] sm:text-[13px] md:text-xl leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    Watch on YouTube
                  </span>
                  <div className="h-px flex-1 bg-border/50 group-hover:bg-primary/30 transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}