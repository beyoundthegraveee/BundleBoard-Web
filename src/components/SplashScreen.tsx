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
    const exitTimer = setTimeout(() => {
      setFadeExit(true);
    }, 2200);

    const destroyTimer = setTimeout(() => {
      setIsMounted(false);
      onAnimationComplete();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(destroyTimer);
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
      <h1 className="font-display text-4xl sm:text-5xl tracking-[0.25em] uppercase flex items-center opacity-0 animate-splash-logo">
        <span className="font-black text-white">Bundle</span>
        <span className="font-extralight text-zinc-300">board</span>
      </h1>
    </div>
  );
}