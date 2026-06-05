"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, X, Upload, Trash2, Image as ImageIcon } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number, description: string, previewImagePath?: string | null) => Promise<void>;
  isLoading: boolean;
  initialData: {
    id: string;
    name: string;
    price: number;
    description: string;
    previewImage?: string;
  };
}

export function EditAssetModal({ isOpen, onClose, onSave, isLoading, initialData }: EditAssetModalProps) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: ""
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isImageRemoved, setIsImageRemoved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData.name || "",
        price: initialData.price ? initialData.price.toString() : "0.00",
        description: initialData.description || ""
      })
      setPreviewUrl(initialData.previewImage || null)
      setImageFile(null)
      setIsImageRemoved(false)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsImageRemoved(false)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    setIsImageRemoved(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    let finalImagePath: string | null | undefined = undefined;

    if (isImageRemoved) {
      finalImagePath = null;
    } else if (imageFile) {
      setIsUploading(true)
      try {
        const fileName = `collections/${initialData.id}-${Date.now()}.webp`
        const { error: uploadError } = await supabase.storage
          .from("previews")
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("previews")
          .getPublicUrl(fileName)

        finalImagePath = publicUrl
      } catch (err) {
        console.error("Image upload failed:", err)
        alert("Failed to sync visual payload to storage.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    await onSave(form.name, numericPrice, form.description, finalImagePath)
  }

  const isWorking = isLoading || isUploading

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-card border border-border/60 w-full max-w-md p-6 relative rounded-none shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <div className="mb-4 border-b border-border/40 pb-3 flex justify-between items-center sticky top-0 bg-card z-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Modify Asset Manifest</h3>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isWorking}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X size={14}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Visual Payload (Preview)</label>
            <div className="border border-border/40 bg-muted/10 p-1">
              {previewUrl ? (
                <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                     <label className="cursor-pointer bg-primary text-primary-foreground px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                        Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isWorking} />
                     </label>
                     <button type="button" onClick={handleRemoveImage} disabled={isWorking} className="bg-destructive text-destructive-foreground px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5">
                        <Trash2 size={10} /> Remove
                     </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-accent/50 transition-colors border border-dashed border-border/60 m-1">
                  <ImageIcon size={20} className="text-muted-foreground/60 mb-2" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Select Image Node</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isWorking} />
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Name</label>
            <input 
              type="text" 
              required
              disabled={isWorking}
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors disabled:opacity-50"
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
              disabled={isWorking}
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground font-mono outline-none rounded-none focus:border-primary transition-colors disabled:opacity-50"
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
              disabled={isWorking}
              className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors resize-none leading-relaxed disabled:opacity-50"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 select-none pt-4 border-t border-border/20 sticky bottom-0 bg-card">
            <button 
              type="button"
              onClick={onClose}
              disabled={isWorking}
              className="px-4 py-2 border border-border/80 text-foreground bg-background hover:bg-accent text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isWorking}
              className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 transition-opacity disabled:opacity-50"
            >
              {isWorking ? <Loader2 className="animate-spin h-3 w-3" /> : <Upload className="h-3 w-3" />}
              {isUploading ? "Uploading Image..." : isLoading ? "Committing..." : "Commit Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}