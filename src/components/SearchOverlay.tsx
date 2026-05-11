"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Search, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      inputRef.current?.focus()
    } else {
      document.body.style.overflow = 'unset'
      setQuery("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f4f4]/95 backdrop-blur-md font-mono">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-2 hover:rotate-90 transition-transform duration-300"
      >
        <X size={40} className="text-black" />
      </button>

      <div className="container mx-auto px-4 h-full flex flex-col justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
          <div className="relative group">
            <span className="text-red-600 font-black text-xs block mb-4 tracking-[0.4em] animate-pulse">
              // SYSTEM_SEARCH_PROTOCOL_ACTIVE
            </span>
            
            <div className="flex items-center border-b-4 border-black pb-4 transition-all focus-within:border-red-600">
              <Search size={48} className="mr-6 text-black opacity-20" />
              <input
                ref={inputRef}
                type="text"
                placeholder="ENTER_KEYWORDS..."
                className="w-full bg-transparent text-5xl md:text-8xl font-black uppercase outline-none placeholder:text-black/10 italic tracking-tighter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                className={`p-4 transition-all ${query ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
              >
                <ArrowRight size={64} className="text-red-600" />
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              {['Brushes', 'Mockups', 'VFX', 'Bundles', 'Textures'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 border-2 border-black font-black uppercase text-[10px] hover:bg-black hover:text-white transition-colors"
                >
                  _{tag}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="absolute bottom-10 left-10 hidden md:block">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">
                Press [ESC] to abort // Press [ENTER] to execute_search
            </p>
        </div>
      </div>
    </div>
  )
}