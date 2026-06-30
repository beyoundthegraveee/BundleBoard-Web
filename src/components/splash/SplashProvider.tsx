'use client';

import { useState, useEffect} from "react";
import SplashScreen from "@/components/splash/SplashScreen"; 

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const executed = sessionStorage.getItem("platform_splash_executed");
    if (!executed) {
      setShowSplash(true);
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null; 

  return <>{children}</>;
}