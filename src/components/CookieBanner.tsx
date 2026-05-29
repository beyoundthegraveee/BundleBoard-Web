"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Check } from "lucide-react"

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
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-8 animate-in slide-in-from-bottom duration-500">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] p-6 md:p-8 font-mono relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-red-600 h-6 w-6 stroke-[2.5]" />
                <h3 className="text-lg font-bold uppercase tracking-tighter">
                  GDPR_Protocol: Privacy_Notice
                </h3>
              </div>
              <p className="text-[11px] md:text-xs font-medium leading-relaxed uppercase opacity-80">
                We use cookies to ensure you get the best experience on BundleBoard. 
                In accordance with GDPR regulations, we require your consent to process analytical data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => handleConsent("essential")}
                className="px-6 py-3 border-2 border-black font-bold uppercase text-[10px] hover:bg-zinc-100 transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                Only_Essential
              </button>

              <button
                onClick={() => handleConsent("all")}
                className="px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase text-[10px] shadow-[4px_4px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                Accept_All <Check size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-black border-dotted">
            <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">
              Current_Node: Warsaw_Masovian_District // Privacy_Compliance: Active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}