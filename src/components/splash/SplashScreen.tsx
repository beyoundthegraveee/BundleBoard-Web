'use client';

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(true);
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const exitTimer = setTimeout(() => {
      setFadeExit(true);
    }, 2200);

    const destroyTimer = setTimeout(() => {
      setIsMounted(false);
      document.body.style.overflow = 'unset';
      onAnimationComplete();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(destroyTimer);
      document.body.style.overflow = 'unset';
    };
  }, [onAnimationComplete]);

  if (!isMounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black flex items-center justify-center select-none z-[99999]",
        fadeExit && "animate-splash-bg-exit"
      )}
    >
      <h1 className="font-display text-2xl sm:text-4xl md:text-5xl tracking-[0.15em] sm:tracking-[0.25em] uppercase flex items-center opacity-0 animate-splash-logo whitespace-nowrap">
        <span className="font-black text-white">Bundle</span>
        <span className="font-extralight text-zinc-300">board</span>
      </h1>
    </div>
  );
}