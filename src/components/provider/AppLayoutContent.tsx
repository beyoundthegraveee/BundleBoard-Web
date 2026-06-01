'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from "@/components/Navbar";
import { CookieBanner } from "@/components/CookieBanner";

const SplashScreen = dynamic(() => import('@/components/SplashScreen'), {
  ssr: false,
});

export function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenSplash = sessionStorage.getItem('bb_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-black z-[99999]" />;
  }

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen animate-layout-fade">
      <Navbar />
      <div className="flex-1 w-full relative">
        {children}
      </div>
      <CookieBanner />

      <style jsx global>{`
        @keyframes layoutFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-layout-fade {
          animation: layoutFadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}