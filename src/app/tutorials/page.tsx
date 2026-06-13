import React from "react";
import { BookOpen, Video, PlayCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tutorials | BundleBoard",
  description: "Learn how to use your digital assets with our comprehensive guides.",
};

const DUMMY_TUTORIALS = [
  { id: 1, type: "video", title: "Mastering Photoshop Brushes", category: "Workflow", duration: "12 min" },
  { id: 2, type: "article", title: "Applying LUTs in Premiere Pro", category: "Color Grading", duration: "5 min read" },
  { id: 3, type: "video", title: "Creating Realistic Mockups", category: "Design", duration: "18 min" },
  { id: 4, type: "article", title: "Organizing Your Asset Library", category: "Productivity", duration: "4 min read" },
];

export default function TutorialsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 animate-in fade-in duration-500">
      <div className="max-w-3xl mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight font-display">
          Tutorials
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Level up your creative workflow. Learn how to extract maximum value from BundleBoard assets, master new software tools, and streamline your process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_TUTORIALS.map((tutorial) => (
          <Link 
            key={tutorial.id} 
            href="#" 
            className="group flex flex-col border border-border/50 bg-card hover:border-primary transition-colors rounded-none overflow-hidden"
          >
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              {tutorial.type === "video" ? (
                <PlayCircle className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              ) : (
                <BookOpen className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              )}
              <div className="absolute top-3 left-3 bg-background/90 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-foreground">
                {tutorial.category}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {tutorial.type === "video" ? <Video className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                {tutorial.duration}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}