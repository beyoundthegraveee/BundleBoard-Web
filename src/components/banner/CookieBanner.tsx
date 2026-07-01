"use client"

import { useState, useEffect } from "react"
import { Shield, Check } from "lucide-react"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMounted(true)
      
      const consent = localStorage.getItem("cookie-consent")
      if (!consent) {
        setIsVisible(true)
      }
    }, 400)
    
    return () => clearTimeout(timer)
  }, [])

  const handleConsent = (type: "all" | "essential") => {
    localStorage.setItem("cookie-consent", type)
    setIsVisible(false)
  }

  if (!hasMounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-3 sm:p-6 md:p-8 animate-in slide-in-from-bottom ease-out duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 p-4 sm:p-6 md:p-8 font-sans rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1 space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-1.5 md:gap-2 text-primary">
                <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[1.5]" />
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground">
                  Privacy Compliance Notice
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs font-normal leading-relaxed text-muted-foreground">
                We use cookies to ensure you get the best experience on BundleBoard. 
                In accordance with global privacy standards, we require your consent to process anonymous analytical data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <button
                onClick={() => handleConsent("essential")}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2.5 border border-border/80 text-foreground bg-background hover:bg-accent font-semibold uppercase text-[9px] sm:text-[10px] tracking-wider transition-colors rounded-none"
              >
                Only Essential
              </button>

              <button
                onClick={() => handleConsent("all")}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[9px] sm:text-[10px] tracking-wider transition-opacity flex items-center justify-center gap-1.5 rounded-none"
              >
                Accept All <Check size={12} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-border/30 border-dashed flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-[8px] sm:text-[9px] text-muted-foreground/60 uppercase tracking-widest font-medium">
            <span>Location Framework: Warsaw District</span>
            <span>Privacy Protocol Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}