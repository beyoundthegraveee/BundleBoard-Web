'use client';

import { useState } from "react";
import SplashScreen from "@/components/splash/SplashScreen"; 

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("platform_splash_executed");
  });
  const [isReady] = useState(true);

  const handleSplashComplete = () => {
    sessionStorage.setItem("platform_splash_executed", "true");
    setShowSplash(false);
  };

  if (!isReady) {
    return <div className="fixed inset-0 bg-black z-[99999]" />;
  }

  return (
    <>
      {children}
      
      {showSplash && (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      )}
    </>
  );
}