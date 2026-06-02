'use client';

import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("platform_splash_executed");
    
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
    setIsReady(true);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("platform_splash_executed", "true");
    setShowSplash(false);
  };

  if (!isReady) {
    return <div className="fixed inset-0 bg-black z-[99999]" />;
  }

  return (
    <>
      {showSplash ? (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      ) : (
        children
      )}
    </>
  );
}