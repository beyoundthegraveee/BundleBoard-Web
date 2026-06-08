"use client"

import * as React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Search, X, ArrowRight, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const SEARCH_COLLECTIONS_QUERY = `
  query SearchCollections($query: String!, $page: Int!, $size: Int!) {
    searchCollections(query: $query, page: $page, size: $size) {
      id
      name
      price
      galleryImages { filePath }
    }
  }
`;

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const RECOMMENDATIONS = [
  { id: 1, title: "Ultimate Photoshop Brushes", category: "Brushes", price: 19.00 },
  { id: 2, title: "Minimalist Device Mockups", category: "Mockups", price: 25.00 },
]

const TRENDING_COLLECTIONS = [
  { id: 3, title: "Grainy Texture Pack", category: "Textures", price: 12.00 },
  { id: 4, title: "Cinematic LUTs Vol.2", category: "Color Grading", price: 15.00 },
]

const QUICK_LINKS = ["New Arrivals", "Best Sellers", "Free Assets", "Premium Bundles"]

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      setQuery("")
      setSearchResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: SEARCH_COLLECTIONS_QUERY,
            variables: { 
              query: debouncedQuery,
              page: 0,
              size: 5
            }
          })
        })
        const result = await response.json()
        
        if (result.data?.searchCollections) {
          setSearchResults(result.data.searchCollections)
        }
      } catch (err) {
        console.error("SEARCH_FETCH_FAILURE:", err)
      } finally {
        setIsSearching(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const listVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ top: "-100vh" }}
            animate={{ top: "0" }}
            exit={{ top: "-100vh" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="fixed left-0 right-0 z-[65] bg-card/95 backdrop-blur-xl border-b border-border/40 font-sans shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-10 relative">
              <div className="flex items-center gap-6 max-w-5xl mx-auto mb-12 border-b border-border/40 pb-4 focus-within:border-primary transition-colors">
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
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 min-h-[300px]">
                <div className="md:col-span-4 space-y-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 stroke-[2] text-primary" /> Active Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map((link) => (
                      <Link 
                        key={link} 
                        href={`/search?q=${link}`}
                        className="px-3 py-1.5 bg-muted/30 border border-border/40 text-[10px] font-bold text-foreground hover:bg-foreground hover:text-background transition-all uppercase tracking-wider rounded-none"
                        onClick={onClose}
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-8 relative">
                  <AnimatePresence mode="wait">
                    {query.trim().length >= 2 ? (
                      <motion.div key="results" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          Live Results
                        </h3>
                        
                        {searchResults.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {searchResults.map((item) => (
                              <Link
                                key={item.id}
                                href={`/collection/${item.id}`}
                                onClick={onClose}
                                className="group flex items-center justify-between p-3 border border-border/20 bg-background/50 hover:bg-accent hover:border-border/60 transition-all rounded-none"
                              >
                                <div className="flex items-center gap-4">
                                  {item.galleryImages?.[0]?.filePath ? (
                                    <img 
                                      src={item.galleryImages[0].filePath} 
                                      alt="" 
                                      className="w-12 h-12 object-cover bg-muted border border-border/20" 
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-muted border border-border/20 flex items-center justify-center text-[9px] uppercase text-muted-foreground/50 tracking-widest font-bold">
                                      N/A
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    <div className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                      {item.name}
                                    </div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                      Asset Node
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 pr-2">
                                  <span className="font-mono text-xs font-bold text-foreground">
                                    ${item.price?.toFixed(2) || "0.00"}
                                  </span>
                                  <ArrowRight className="h-4 w-4 stroke-[1.5] text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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

                      <motion.div key="default" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            System Recommendations
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {RECOMMENDATIONS.map((item) => (
                              <Link
                                key={item.id}
                                href={`/collection/${item.id}`}
                                onClick={onClose}
                                className="group flex flex-col justify-between p-4 border border-border/20 bg-background/30 hover:bg-accent hover:border-border/50 transition-all rounded-none min-h-[100px]"
                              >
                                <div className="space-y-1 mb-4">
                                  <div className="font-bold text-sm tracking-tight text-foreground transition-colors group-hover:text-primary">
                                    {item.title}
                                  </div>
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {item.category}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto border-t border-border/20 pt-3">
                                  <span className="font-mono text-xs font-bold text-foreground">${item.price.toFixed(2)}</span>
                                  <ArrowRight className="h-3.5 w-3.5 stroke-[2] text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Тренды */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Trending Now
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TRENDING_COLLECTIONS.map((item) => (
                              <Link
                                key={item.id}
                                href={`/collection/${item.id}`}
                                onClick={onClose}
                                className="group flex flex-col justify-between p-4 border border-border/20 bg-background/30 hover:bg-accent hover:border-border/50 transition-all rounded-none min-h-[100px]"
                              >
                                <div className="space-y-1 mb-4">
                                  <div className="font-bold text-sm tracking-tight text-foreground transition-colors group-hover:text-primary">
                                    {item.title}
                                  </div>
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {item.category}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto border-t border-border/20 pt-3">
                                  <span className="font-mono text-xs font-bold text-foreground">${item.price.toFixed(2)}</span>
                                  <ArrowRight className="h-3.5 w-3.5 stroke-[2] text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}