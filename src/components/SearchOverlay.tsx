"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight, TrendingUp, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const RECOMMENDATIONS = [
  { id: 1, title: "Ultimate_Photoshop_Brushes", category: "Brushes", price: "$19" },
  { id: 2, title: "Minimalist_Device_Mockups", category: "Mockups", price: "$25" },
  { id: 3, title: "Grainy_Texture_Pack", category: "Textures", price: "$12" },
]

const QUICK_LINKS = ["New_Arrivals", "Best_Sellers", "Free_Assets", "Premium_Bundles"]

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
          {/* Задний фон-оверлей (Заменили размытие на жесткий бруталистичный полупрозрачный слой) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Панель поиска */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "keyframes", duration: 0.2, ease: "linear" }}
            className="fixed top-0 left-0 right-0 z-[70] bg-white border-b-4 border-black font-mono shadow-[0px_10px_0px_rgba(0,0,0,1)]"
          >
            <div className="container mx-auto px-4 py-8">
              
              {/* Контейнер строки ввода */}
              <div className="flex items-center gap-4 max-w-4xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black stroke-[3]" />
                  <input
                    ref={inputRef}
                    className="w-full h-14 pl-12 pr-4 bg-white border-4 border-black rounded-none text-lg font-black uppercase outline-none focus-visible:border-red-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] focus-visible:shadow-[6px_6px_0px_rgba(239,68,68,1)] transition-all placeholder:text-zinc-400 placeholder:font-bold"
                    placeholder="QUERY_CORE_DATABASE..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-3 border-4 border-black rounded-none bg-white hover:bg-zinc-100 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <X className="h-6 w-6 text-black stroke-[3]" />
                </button>
              </div>

              {/* Сетка нижних рекомендаций */}
              <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pb-6">
                
                {/* Тренды (Левая колонка) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 stroke-[3]" /> Trending_Tags
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {QUICK_LINKS.map((link) => (
                      <Link 
                        key={link} 
                        href={`/search?q=${link}`}
                        className="px-3 py-1.5 bg-white border-2 border-black rounded-none text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-black hover:text-white transition-all"
                        onClick={onClose}
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Рекомендации (Правая колонка) */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <Star className="h-4 w-4 stroke-[3]" /> Recommended_Bundles
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RECOMMENDATIONS.map((item) => (
                      <Link
                        key={item.id}
                        href={`/bundles/${item.id}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-4 border-2 border-black rounded-none bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                      >
                        <div>
                          <div className="font-black text-xs uppercase tracking-tight group-hover:text-red-600 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">
                            [{item.category}]_NODE
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-zinc-100 px-1.5 py-0.5 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">{item.price}</span>
                          <ArrowRight className="h-4 w-4 stroke-[3] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-red-600" />
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