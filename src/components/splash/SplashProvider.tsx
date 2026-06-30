'use client';

import { useState, useEffect } from "react";
import SplashScreen from "@/components/splash/SplashScreen"; 

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const executed = sessionStorage.getItem("platform_splash_executed");
    
    const initTimer = setTimeout(() => {
      if (executed) {
        setIsReady(true);
      } else {
        setShowSplash(true);
      }
    }, 0);

    return () => clearTimeout(initTimer);
  }, []);

  const handleAnimationComplete = () => {
    setShowSplash(false);
    setIsReady(true);
    sessionStorage.setItem("platform_splash_executed", "true");
  };

  if (!isReady && !showSplash) return null; 

  return (
    <>
      {showSplash && <SplashScreen onAnimationComplete={handleAnimationComplete} />}
      {isReady && children}
    </>
  );
}