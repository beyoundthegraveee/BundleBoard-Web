"use client"

import { useState, useEffect } from "react"
import { Shield, Check } from "lucide-react"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleConsent = (type: "all" | "essential") => {
    localStorage.setItem("cookie-consent", type)
    setIsVisible(false)
  }

  if (!hasMounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-6 md:p-8 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 backdrop-blur-xl border border-border/60 p-6 md:p-8 font-sans rounded-none shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4 stroke-[1.5]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Privacy Compliance Notice
                </h3>
              </div>
              <p className="text-xs font-normal leading-relaxed text-muted-foreground">
                We use cookies to ensure you get the best experience on BundleBoard. 
                In accordance with global privacy standards, we require your consent to process anonymous analytical data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => handleConsent("essential")}
                className="px-5 py-2.5 border border-border/80 text-foreground bg-background hover:bg-accent font-semibold uppercase text-[10px] tracking-wider transition-colors rounded-none"
              >
                Only Essential
              </button>

              <button
                onClick={() => handleConsent("all")}
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[10px] tracking-wider transition-opacity flex items-center justify-center gap-2 rounded-none"
              >
                Accept All <Check size={12} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border/30 border-dashed flex justify-between items-center text-[9px] text-muted-foreground/60 uppercase tracking-widest font-medium">
            <span>Location Framework: Warsaw District</span>
            <span>Privacy Protocol Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}