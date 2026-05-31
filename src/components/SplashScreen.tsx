'use client';

import { useEffect, useState } from 'react';

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
      className="fixed inset-0 bg-black flex items-center justify-center select-none z-[99999]"
      style={{
        animation: fadeExit ? 'fadeOutBg 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
      }}
    >
      <h1 
        className="font-display text-4xl sm:text-5xl tracking-[0.25em] uppercase flex items-center opacity-0"
        style={{
          animation: 'fadeInLogo 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) forwards, zoomLogo 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <span className="font-black text-white">Bundle</span>
        <span className="font-extralight text-zinc-300">board</span>
      </h1>

      <style jsx global>{`
        @keyframes fadeInLogo {
          0% { opacity: 0; filter: blur(8px); }
          100% { opacity: 1; filter: blur(0); }
        }
        @keyframes zoomLogo {
          0% { transform: scale(0.95); }
          100% { transform: scale(1.03); }
        }
        @keyframes fadeOutBg {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}