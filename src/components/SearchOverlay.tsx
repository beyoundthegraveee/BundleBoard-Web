"use client"

import * as React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Search, X, ArrowRight, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useLazyQuery, useQuery } from "@apollo/client/react" 
import { SearchCollectionsDocument, GetLatestCollectionsDocument } from "@/graphql/generated" 

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Ленивый запрос для активного поиска
  const [executeSearch, { loading: isSearching, data }] = useLazyQuery(SearchCollectionsDocument);

  // Загружаем 6 штук для New Arrivals
  const { data: latestData, loading: isLatestLoading } = useQuery(GetLatestCollectionsDocument, {
    variables: { limit: 6 }, 
    skip: !isOpen || debouncedQuery.trim().length >= 2,
    fetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      setQuery("")
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      executeSearch({
        variables: { query: debouncedQuery, page: 0, size: 6 }
      });
    }
  }, [debouncedQuery, executeSearch])

  const searchResults = data?.searchCollections ?? [];
  const latestCollections = latestData?.getLatestCollections ?? [];

  // Анимация для списков внутри оверлея
  const listVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Задник с блюром */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />
          
          {/* Основной оверлей */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 z-[65] bg-card/95 backdrop-blur-xl border-b border-border/40 font-sans shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-12 relative">
              
              {/* Поисковая строка */}
              <div className="flex items-center gap-6 max-w-5xl mx-auto mb-10 border-b border-border/40 pb-4 focus-within:border-primary transition-colors">
                <Search className="h-6 w-6 text-muted-foreground stroke-[1.5]" />
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    className="w-full bg-transparent text-2xl md:text-3xl font-sans font-medium text-foreground outline-none placeholder:text-muted-foreground/30 transition-all"
                    placeholder="Querying BundleBoard Registry..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <button 
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground p-2 transition-colors"
                  >
                    <X className="h-6 w-6 stroke-[1.5]" />
                  </button>
                )}
              </div>

              {/* Основной контент (На всю ширину) */}
              <div className="max-w-5xl mx-auto min-h-[300px]">
                <AnimatePresence mode="wait">
                  {query.trim().length >= 2 ? (
                    
                    // РЕЗУЛЬТАТЫ ПОИСКА (Теперь карточки гораздо крупнее)
                    <motion.div key="results" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        Live Results
                      </h3>
                      
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {searchResults.map((item: any) => (
                            <Link
                              key={item.id}
                              href={`/collection/${item.id}`}
                              onClick={onClose}
                              className="group flex items-center justify-between p-4 md:p-5 border border-border/30 bg-background/60 hover:bg-accent/80 hover:border-border/80 transition-all duration-300 rounded-none shadow-sm"
                            >
                              <div className="flex items-center gap-5 md:gap-6">
                                {item.galleryImages?.[0]?.filePath ? (
                                  <img 
                                    src={item.galleryImages[0].filePath} 
                                    alt={item.name} 
                                    className="w-20 h-20 md:w-24 md:h-24 object-cover bg-muted border border-border/20" 
                                  />
                                ) : (
                                  <div className="w-20 h-20 md:w-24 md:h-24 bg-muted border border-border/20 flex items-center justify-center text-[10px] uppercase text-muted-foreground/50 tracking-widest font-bold">
                                    N/A
                                  </div>
                                )}
                                <div className="space-y-1.5">
                                  <div className="font-bold text-base md:text-lg tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Asset Node
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col justify-center items-end gap-3 pl-4">
                                <span className="font-mono text-sm md:text-base font-bold text-foreground">
                                  ${item.price?.toFixed(2) || "0.00"}
                                </span>
                                <ArrowRight className="h-5 w-5 stroke-[1.5] text-primary opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-16 text-center border border-dashed border-border/40 bg-muted/10">
                          No matching nodes found in the registry.
                        </div>
                      )}
                    </motion.div>

                  ) : (

                    // ДЕФОЛТНОЕ СОСТОЯНИЕ: NEW ARRIVALS
                    <motion.div key="default" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 stroke-[2] text-primary" /> New Arrivals
                        </h3>
                        
                        {isLatestLoading ? (
                           <div className="py-12 flex justify-center">
                             <Loader2 className="animate-spin text-muted-foreground h-6 w-6" />
                           </div>
                        ) : latestCollections.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {latestCollections.map((item: any) => (
                              <Link
                                key={item.id}
                                href={`/collection/${item.id}`}
                                onClick={onClose}
                                className="group flex flex-col justify-between p-5 border border-border/30 bg-background/40 hover:bg-accent hover:border-border/60 transition-all rounded-none min-h-[110px]"
                              >
                                <div className="space-y-1 mb-5">
                                  <div className="font-bold text-base tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Registry Addition
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto border-t border-border/20 pt-3">
                                  <span className="font-mono text-sm font-bold text-foreground">
                                    ${item.price?.toFixed(2) || "0.00"}
                                  </span>
                                  <ArrowRight className="h-4 w-4 stroke-[1.5] text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-12 text-center border border-dashed border-border/40">
                            No recent nodes found.
                          </div>
                        )}
                      </div>
                    </motion.div>
                    
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}