'use client';

import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { Navbar } from "@/components/Navbar";
import { CookieBanner } from "@/components/CookieBanner";

export function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('bb_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('bb_splash_seen', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <div className="flex flex-col min-h-screen animate-layout-fade">
      <Navbar />
      <main className="flex-1 w-full relative">
        {children}
      </main>
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