"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const RECOMMENDATIONS = [
  { id: 1, title: "Ultimate Photoshop Brushes", category: "Brushes", price: "$19" },
  { id: 2, title: "Minimalist Device Mockups", category: "Mockups", price: "$25" },
  { id: 3, title: "Grainy Texture Pack", category: "Textures", price: "$12" },
]

const QUICK_LINKS = ["New Arrivals", "Best Sellers", "Free Assets", "Premium Bundles"]

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      setQuery("")
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ top: "-100vh" }}
            animate={{ top: "5rem" }}
            exit={{ top: "-100vh" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[65] bg-[#121115]/85 backdrop-blur-xl border-b border-white/[0.06] font-sans shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 relative">
              
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-zinc-400" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-zinc-400" />
              
              <div className="flex items-center gap-6 max-w-5xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 stroke-[1.8]" />
                  <input
                    ref={inputRef}
                    className="w-full h-12 pl-11 bg-[#1a191e] border border-white/[0.08] text-sm font-normal text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-zinc-500"
                    placeholder="Querying BundleBoard Database..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white hover:bg-white/5 p-3 transition-colors"
                >
                  <X className="h-4 w-4 stroke-[1.8]" />
                </button>
              </div>

              <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 pb-2">
                
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 stroke-[1.8] text-blue-500" /> Trending Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map((link) => (
                      <Link 
                        key={link} 
                        href={`/search?q=${link}`}
                        className="px-3 py-1.5 bg-white/5 border border-white/[0.06] text-[11px] font-normal text-zinc-300 hover:bg-white hover:text-black transition-all uppercase tracking-wider"
                        onClick={onClose}
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 stroke-[1.8] text-blue-500" /> Recommended Bundles
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RECOMMENDATIONS.map((item) => (
                      <Link
                        key={item.id}
                        href={`/bundles/${item.id}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-4 border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-[14px] tracking-tight text-zinc-100 transition-colors group-hover:text-blue-400">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-normal text-zinc-500 uppercase tracking-widest">
                            {item.category} // Node
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/[0.06] px-2 py-1">{item.price}</span>
                          <ArrowRight className="h-3.5 w-3.5 stroke-[1.8] text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}