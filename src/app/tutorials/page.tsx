import React from "react";
import { PlayCircle, Clock, Zap } from "lucide-react";

export const metadata = {
  title: "Tutorials | BundleBoard",
  description: "Learn how to use your digital assets with our comprehensive video guides.",
};

// 12 реальных обучающих роликов с YouTube для старта
const YOUTUBE_TUTORIALS = [
  // Premiere Pro
  { id: 1, youtubeId: "W2DAXqS7G4E", title: "Premiere Pro for Beginners | Quick 25-Minute Tutorial!", category: "Premiere Pro", duration: "26:00" },
  { id: 2, youtubeId: "QPXGuqeUo6g", title: "Full Adobe Premiere Pro Tutorial (how to edit videos)", category: "Premiere Pro", duration: "34:34" },
  { id: 3, youtubeId: "IBWhFbnEs8s", title: "25 Rapid Fire Premiere Pro Tricks You Never Knew!", category: "Premiere Pro", duration: "13:15" },
  { id: 4, youtubeId: "oUlpbue-Gw0", title: "Learn Premiere Pro in 10 minutes - Beginner Tutorial", category: "Premiere Pro", duration: "10:36" },
  { id: 5, youtubeId: "BeH1I5n-798", title: "How to Edit a Video in Adobe Premiere (Complete Beginners)", category: "Premiere Pro", duration: "40:02" },
  
  // Photoshop
  { id: 6, youtubeId: "3wZPGUf8olE", title: "Photoshop Smoke Effect – Simple & Very Easy Tutorial", category: "Photoshop", duration: "5:46" },
  { id: 7, youtubeId: "qwNbjGyhZ48", title: "Photoshop Tutorial for Beginners | Everything You NEED to KNOW!", category: "Photoshop", duration: "28:52" },
  { id: 8, youtubeId: "IyR_uYsRdPs", title: "Photoshop for Beginners | FREE COURSE", category: "Photoshop", duration: "3:07:02" },
  { id: 9, youtubeId: "OKkWRpoIFuw", title: "Photoshop for Complete Beginners: Start Here | Lesson 1", category: "Photoshop", duration: "1:00:36" },
  { id: 10, youtubeId: "pFyOznL9UvA", title: "Adobe Photoshop Tutorial : The Basics for Beginners", category: "Photoshop", duration: "36:57" },

  // After Effects
  { id: 11, youtubeId: "h3B5_XIctMU", title: "How to use After Effects for Beginners | Getting Familiar", category: "After Effects", duration: "7:47" },
  { id: 12, youtubeId: "hb2bbfiNBXA", title: "Learn After Effects in 10 Minutes! Beginner Tutorial", category: "After Effects", duration: "10:09" },
];

export default function TutorialsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Технический фон */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Увеличенная ширина контейнера для больших карточек */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 animate-in fade-in duration-500 font-sans">
        
        {/* Заголовок */}
        <div className="max-w-3xl mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Zap size={12} className="fill-primary" />
            Knowledge Base
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight font-display text-foreground leading-none">
            Video <span className="text-muted-foreground">Tutorials</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-border/60 pl-4">
            Level up your creative workflow. Learn how to extract maximum value from BundleBoard assets, master new software tools, and streamline your entire process.
          </p>
        </div>

        {/* Сетка видео (Адаптивная: 1 колонка -> 2 колонки -> 3 колонки на очень широких экранах) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
          {YOUTUBE_TUTORIALS.map((tutorial) => (
            <a 
              key={tutorial.id} 
              href={`https://www.youtube.com/watch?v=${tutorial.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col border border-border/50 bg-card hover:border-primary transition-all duration-300 rounded-none overflow-hidden shadow-sm hover:shadow-primary/5"
            >
              {/* Обложка-плеер */}
              <div className="aspect-video bg-[#111013] relative flex items-center justify-center overflow-hidden border-b border-border/20">
                {/* Динамическое получение превью в максимальном качестве */}
                <img 
                  src={`https://img.youtube.com/vi/${tutorial.youtubeId}/maxresdefault.jpg`} 
                  alt={tutorial.title} 
                  className="object-cover w-full h-full opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                
                {/* Легкий градиент снизу для читаемости текста */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                
                {/* Иконка Play по центру */}
                <PlayCircle 
                  className="absolute w-14 h-14 text-white/50 group-hover:text-primary group-hover:scale-110 transition-all duration-300 drop-shadow-2xl" 
                  strokeWidth={1.2} 
                />
                
                {/* Бейдж категории */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-foreground border border-white/10">
                  {tutorial.category}
                </div>
                
                {/* Бейдж длительности */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md px-2 py-1 text-[10px] font-bold tracking-widest text-foreground flex items-center gap-1.5 border border-white/10">
                  <Clock className="w-3 h-3" strokeWidth={2} /> 
                  <span className="mt-px">{tutorial.duration}</span>
                </div>
              </div>
              
              {/* Текстовая часть */}
              <div className="p-6 md:p-8 flex flex-col flex-1 justify-between gap-4 bg-card/40 backdrop-blur-sm">
                <h3 className="font-bold text-lg md:text-xl leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
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