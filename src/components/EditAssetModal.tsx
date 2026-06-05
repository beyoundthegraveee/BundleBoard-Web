"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, X, Upload, Trash2, Image as ImageIcon, GripHorizontal } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { convertToWebP } from '@/lib/imageProcessor'

interface GalleryItem {
  id: string;
  filePath: string;
  file: File | null;
  isNew: boolean;
}

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number, description: string, galleryImages: any[]) => Promise<void>;
  isLoading: boolean;
  initialData: {
    id: string;
    name: string;
    price: number;
    description: string;
    galleryImages?: { filePath: string }[];
  };
}

const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
  });
};

export function EditAssetModal({ isOpen, onClose, onSave, isLoading, initialData }: EditAssetModalProps) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: ""
  })
  
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      setValidationError(null)
      setForm({
        name: initialData.name || "",
        price: initialData.price ? initialData.price.toString() : "5.00",
        description: initialData.description || ""
      })
      if (initialData.galleryImages) {
        setGallery(initialData.galleryImages.map(img => ({
          id: Math.random().toString(36).substring(7),
          filePath: img.filePath,
          file: null,
          isNew: false
        })))
      } else {
        setGallery([])
      }
    }
  }, [isOpen, initialData])

  useEffect(() => {
    return () => {
      gallery.forEach(item => {
        if (item.isNew && item.filePath.startsWith('blob:')) {
          URL.revokeObjectURL(item.filePath)
        }
      })
    }
  }, [gallery])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValidationError(null)
      const incomingFiles = Array.from(e.target.files)
      
      setGallery((prev) => {
        const currentTotal = prev.length + incomingFiles.length;
        if (currentTotal > 5) {
          setValidationError("Maximum 5 gallery preview images are allowed.")
          const availableSlots = 5 - prev.length;
          const allowedFiles = incomingFiles.slice(0, availableSlots);
          const newItems = allowedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            filePath: URL.createObjectURL(file),
            isNew: true
          }))
          return [...prev, ...newItems];
        }

        const newItems = incomingFiles.map(file => ({
          id: Math.random().toString(36).substring(7),
          file,
          filePath: URL.createObjectURL(file),
          isNew: true
        }))

        return [...prev, ...newItems]
      })
      e.target.value = ""
    }
  }

  const removeGalleryItem = (idToRemove: string) => {
    setValidationError(null)
    setGallery((prev) => {
      const item = prev.find(i => i.id === idToRemove);
      if (item && item.isNew && item.filePath.startsWith('blob:')) {
        URL.revokeObjectURL(item.filePath);
      }
      return prev.filter((item) => item.id !== idToRemove)
    })
  }

  const handleDragStart = (index: number) => { setDragItemIndex(index); }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); }
  const handleDrop = (index: number) => {
    if (dragItemIndex === null || dragItemIndex === index) return;
    setGallery((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[dragItemIndex];
      newItems.splice(dragItemIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDragItemIndex(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    const numericPrice = parseFloat(form.price)
    
    if (!form.name.trim() || isNaN(numericPrice) || numericPrice < 5.00) {
      setValidationError("Invalid configuration. Minimum price is 5.00 USD.")
      return
    }

    if (form.description.length < 100) {
      setValidationError(`Description too short (${form.description.length}/100 min).`)
      return
    }

    if (gallery.length === 0) {
      setValidationError("Visual payload incomplete. At least 1 image required.")
      return
    }

    setIsUploading(true)
    const timestamp = Date.now()
    
    try {
      const finalGalleryPromises = gallery.map(async (item, index) => {
        if (!item.isNew && !item.file) {
          return { filePath: item.filePath };
        }

        if (item.isNew && item.file) {
          const webpBlob = await convertToWebP(item.file, 1200, 0.82)
          const { width, height } = await getImageDimensions(webpBlob)
          
          const previewFileName = `collections/update-${initialData.id}-${timestamp}-${index}.webp`
          
          const { error: uploadError } = await supabase.storage
            .from("previews")
            .upload(previewFileName, webpBlob, { upsert: true })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from("previews")
            .getPublicUrl(previewFileName)

          return {
            fileName: previewFileName,
            filePath: publicUrl,
            mimeType: "webp",
            width: width,
            height: height,
            fileSize: webpBlob.size
          }
        }
        
        throw new Error("Invalid gallery item state.");
      });

      const finalGalleryImages = await Promise.all(finalGalleryPromises)
      
      await onSave(form.name, numericPrice, form.description, finalGalleryImages)
    } catch (err: any) {
      console.error("Update failed:", err)
      setValidationError(err.message || "Failed to update asset.")
    } finally {
      setIsUploading(false)
    }
  }

  const isWorking = isLoading || isUploading

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-card border border-border/60 w-full max-w-lg p-6 relative rounded-none shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
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

        {validationError && (
          <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 text-destructive text-[10px] font-semibold uppercase tracking-wide rounded-none whitespace-pre-wrap">
            [ERROR]: {validationError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Visual Payload (Max 5)</label>
              <span className={`text-[9px] font-bold uppercase ${gallery.length === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                {gallery.length} / 5 Images
              </span>
            </div>
            
            <div className="border border-border/40 bg-muted/10 p-2">
              {gallery.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {gallery.map((item, idx) => (
                    <div 
                      key={item.id} 
                      draggable={!isWorking}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`relative aspect-square bg-muted overflow-hidden border group transition-all
                        ${isWorking ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-primary/50'}
                        ${dragItemIndex === idx ? 'opacity-40 border-primary scale-95' : 'border-border/40'}
                        ${idx === 0 ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}
                      `}
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest text-center py-0.5 z-10 pointer-events-none shadow-sm">
                          Cover
                        </div>
                      )}
                      <img src={item.filePath} alt="" className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <button 
                        type="button" 
                        onClick={() => removeGalleryItem(item.id)} 
                        disabled={isWorking}
                        className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-destructive rounded-none disabled:opacity-0"
                      >
                        <Trash2 size={14} className="stroke-[1.8]" />
                      </button>
                      
                      {!isWorking && (
                        <GripHorizontal size={14} className="absolute bottom-1 right-1 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity"/>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {gallery.length < 5 && (
                <label className={`flex flex-col items-center justify-center py-4 cursor-pointer transition-colors border border-dashed m-1 ${isWorking ? 'opacity-50 cursor-not-allowed border-border/40' : 'hover:bg-accent/50 border-border/60'}`}>
                  <ImageIcon size={18} className="text-muted-foreground/60 mb-1" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Add Images</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-60">Drag to reorder</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isWorking} />
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
              disabled={isWorking || gallery.length === 0}
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