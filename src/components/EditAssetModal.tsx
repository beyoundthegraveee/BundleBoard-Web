"use client"

import React, { useState } from 'react'
import { Loader2, X } from "lucide-react"

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number, description: string) => Promise<void>;
  isLoading: boolean;
  initialData: {
    name: string;
    price: number;
    description: string;
  };
}

export function EditAssetModal({ isOpen, onClose, onSave, isLoading, initialData }: EditAssetModalProps) {
  const [form, setForm] = useState({
    name: initialData.name,
    price: initialData.price.toString(),
    description: initialData.description || ""
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericPrice = parseFloat(form.price)
    
    if (!form.name.trim() || isNaN(numericPrice) || numericPrice < 5.00) {
      alert("Invalid configuration. Minimum price is 5.00 USD.")
      return
    }

    if (form.description.length < 100) {
      alert("Description requires minimum 100 characters.")
      return
    }

    onSave(form.name, numericPrice, form.description)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-card border border-border/60 w-full max-w-md p-6 relative rounded-none shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="mb-4 border-b border-border/40 pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Modify Asset Manifest</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">License Price (USD)</label>
            <input 
              type="number" 
              step="0.01"
              min="5.00"
              required
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground font-mono outline-none rounded-none focus:border-primary transition-colors"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="grid gap-1">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <label>Description Package</label>
              <span className={form.description.length >= 100 ? "text-primary" : "text-amber-500 font-bold"}>
                {form.description.length}/100 min
              </span>
            </div>
            <textarea 
              rows={4}
              required
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors resize-none leading-relaxed"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 select-none pt-2 border-t border-border/20">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-border/80 text-foreground bg-background hover:bg-accent text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 transition-opacity disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin h-3 w-3" /> : "Commit Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}