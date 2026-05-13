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
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-[70] bg-background border-b shadow-xl"
          >
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4 max-w-4xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    className="w-full h-14 pl-12 pr-4 bg-accent/50 rounded-full text-lg outline-none focus:ring-2 ring-primary/20 transition-all"
                    placeholder="Search for anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Trending
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map((link) => (
                      <Link 
                        key={link} 
                        href={`/search?q=${link}`}
                        className="px-3 py-1.5 bg-accent hover:bg-primary hover:text-primary-foreground rounded-md text-sm transition-colors"
                        onClick={onClose}
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" /> Recommended Bundles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RECOMMENDATIONS.map((item) => (
                      <Link
                        key={item.id}
                        href={`/bundles/${item.id}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-3 border rounded-xl hover:border-primary transition-all bg-card"
                      >
                        <div>
                          <div className="font-medium group-hover:text-primary transition-colors">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.category}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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