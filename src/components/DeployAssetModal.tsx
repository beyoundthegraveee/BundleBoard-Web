"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, X, Image as ImageIcon, FileArchive, Trash2 } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { convertToWebP } from '@/lib/imageProcessor'
import { MAX_FILE_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES } from '@/lib/constants'
import { useMutation } from "@apollo/client/react"
import { CreateCollectionDocument } from '@/graphql/generated'
import type { 
  MimeType, 
  ImageShortInput 
} from '@/graphql/generated'

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
  });
};

interface PreviewFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface DeployAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeployAssetModal({ isOpen, onClose, onSuccess }: DeployAssetModalProps) {
  const [isCreatingAsset, setIsCreatingAsset] = useState(false)
  const [newAsset, setNewAsset] = useState({ name: "", description: "", category: "gradients" })
  const [previewItems, setPreviewItems] = useState<PreviewFileItem[]>([])
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)
  
  // Состояние для галочки прав
  const [rightsConfirmed, setRightsConfirmed] = useState(false)

  const [executeCreate] = useMutation(CreateCollectionDocument)

  useEffect(() => {
    return () => {
      previewItems.forEach(item => URL.revokeObjectURL(item.previewUrl))
    }
  }, [previewItems])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValidationError(null)
      const incomingFiles = Array.from(e.target.files)
      const hasOversizedFiles = incomingFiles.some(file => file.size > MAX_FILE_SIZE_BYTES);
      const oversized = incomingFiles.find(f => f.size > MAX_IMAGE_SIZE_BYTES);

      if (oversized) {
        setValidationError(`Preview images must be under ${process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB} MB.`);
        return;
      }

      if (hasOversizedFiles) {
        setValidationError("One or more images exceed the maximum allowed size of 300 MB.");
        e.target.value = "";
        return;
      }
      
      setPreviewItems((prev) => {
        const currentTotal = prev.length + incomingFiles.length;
        if (currentTotal > 5) {
          setValidationError("Maximum 5 gallery preview images are allowed. Please remove some files first.")
          const availableSlots = 5 - prev.length;
          const allowedFiles = incomingFiles.slice(0, availableSlots);
          
          const newItems = allowedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file)
          }))
          return [...prev, ...newItems];
        }

        const newItems = incomingFiles.map(file => ({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file)
        }))

        return [...prev, ...newItems]
      })
      
      e.target.value = ""
    }
  }

  const removePreviewFile = (indexToRemove: number) => {
    setValidationError(null)
    setPreviewItems((prev) => {
      URL.revokeObjectURL(prev[indexToRemove].previewUrl)
      return prev.filter((_, idx) => idx !== indexToRemove)
    })
  }

  const handleDragStart = (index: number) => { setDragItemIndex(index); }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); }
  const handleDrop = (index: number) => {
    if (dragItemIndex === null || dragItemIndex === index) return;
    setPreviewItems((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[dragItemIndex];
      newItems.splice(dragItemIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDragItemIndex(null);
  }

  const handleDeployCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (newAsset.description.length < 100) {
      setValidationError(`Description requires minimum one hundred characters. Content parameters too short (${newAsset.description.length}/100).`)
      return
    }

    if (previewItems.length === 0 || !projectFile) {
      setValidationError("Deployment manifest incomplete. Upload gallery previews and a secure project archive.")
      return
    }

    if (!rightsConfirmed) {
      setValidationError("You must confirm you have the rights to distribute these files.")
      return
    }

    setIsCreatingAsset(true)

    try {
      const timestamp = Date.now()
      const category = newAsset.category
      const folderId = `collection-${timestamp}`
      const uploadPreviewsPromises = previewItems.map(async (item, index): Promise<ImageShortInput> => {
        const webpBlob = await convertToWebP(item.file, 1200, 0.82)
        const { width, height } = await getImageDimensions(webpBlob)
        
        const previewFileName = `preview-${index}-${timestamp}.webp`
        const previewPath = `${category}/${folderId}/${previewFileName}`
        
        const { error: pError } = await supabase.storage
          .from("previews")
          .upload(previewPath, webpBlob, { 
            contentType: "image/webp",
            cacheControl: "31536000" 
          })
          
        if (pError) throw pError

        const { data: { publicUrl } } = supabase.storage
          .from("previews")
          .getPublicUrl(previewPath)

        return {
          fileName: previewFileName,
          filePath: publicUrl,
          mimeType: "webp",
          width: width,
          height: height,
          fileSize: webpBlob.size
        }
      })

      const uploadedImages = await Promise.all(uploadPreviewsPromises)

      const archivePath = `${category}/${folderId}/${projectFile.name}`
      const { error: vError } = await supabase.storage
        .from("vault")
        .upload(archivePath, projectFile)
        
      if (vError) throw vError
      
      let calculatedMime: MimeType = "zip" 
      if (projectFile.name.endsWith(".rar")) calculatedMime = "rar"
      
      await executeCreate({
        variables: {
          input: {
            name: newAsset.name,
            description: newAsset.description,
            price: 0,
            videoTutorialUrl: `https://youtube.com/watch?v=placeholder-${timestamp}`,
            tagIds: ["1", "2"], 
            mediaResource: {
              fileName: projectFile.name,
              filePath: archivePath,
              mimeType: calculatedMime,
              provider: "local",
              fileSize: projectFile.size
            },
            galleryImages: uploadedImages
          }
        }
      })

      setNewAsset({ name: "", description: "", category: "gradients" })
      setPreviewItems([])
      setProjectFile(null)
      setRightsConfirmed(false)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("CATALOG_DEPLOYMENT_FAILURE:", err)
      setValidationError(err.message || "An unexpected system variation occurred during asset compilation.")
    } finally {
      setIsCreatingAsset(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-card border border-border/60 w-full max-w-lg p-8 relative rounded-none shadow-2xl max-h-[90vh] overflow-y-auto text-foreground">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-none"
        >
          <X className="h-4 w-4 stroke-[1.8]" />
        </button>
        
        <div className="mb-6 border-b border-border/40 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground uppercase">Deploy Free Asset</h3>
          <p className="text-xs text-muted-foreground mt-1.5 font-normal">Submit asset components to initialize public catalog node.</p>
        </div>
        
        {validationError && (
          <div className="mb-5 p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide rounded-none whitespace-pre-wrap">
            {validationError}
          </div>
        )}
        
        <form onSubmit={handleDeployCollection} className="space-y-5">
          <div className="grid gap-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target Category</label>
            <select 
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-3 outline-none text-sm font-normal transition-all focus:border-primary" 
              value={newAsset.category} 
              onChange={e => setNewAsset({...newAsset, category: e.target.value})}
            >
              <option value="gradients">Gradients</option>
              <option value="graphics">Graphics</option>
              <option value="actions-effects">Actions & Effects</option>
              <option value="brushes">Brushes</option>
              <option value="mockups">Mockups</option>
              <option value="textures">Textures</option>
              <option value="fonts">Fonts</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Title</label>
            <input 
              type="text" 
              required 
              minLength={3} 
              maxLength={100} 
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-3 text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/40" 
              placeholder="e.g., Ultra Chrome Gradient Pack" 
              value={newAsset.name} 
              onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <span className={`text-[10px] font-bold tracking-wide uppercase ${newAsset.description.length >= 100 ? 'text-primary' : 'text-amber-500'}`}>
                {newAsset.description.length} of 100 characters minimum
              </span>
            </div>
            <textarea 
              required 
              rows={4} 
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-3 text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/40 resize-none leading-relaxed" 
              placeholder="Specify bundle details, file dimensions, and software compatibility versions..." 
              value={newAsset.description} 
              onChange={e => setNewAsset({...newAsset, description: e.target.value})} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Media Files</label>
              <span className={`text-[9px] font-bold uppercase ${previewItems.length === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                {previewItems.length} / 5 Images
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`border border-dashed p-5 text-center flex flex-col items-center justify-center relative transition-colors rounded-none ${previewItems.length >= 5 ? 'border-border/40 bg-muted/10 cursor-not-allowed opacity-50' : 'border-border/80 bg-background hover:bg-accent/50 cursor-pointer group'}`}>
                <ImageIcon size={18} className="text-muted-foreground mb-2 stroke-[1.5]" />
                <span className="text-[10px] text-muted-foreground mt-1 uppercase font-medium tracking-wider">
                  {previewItems.length >= 5 ? 'Limit reached' : `Select up to 5 (Max ${process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB} MB each)`}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  disabled={previewItems.length >= 5}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  onChange={handleFileChange} 
                />
              </div>

              <div className={`border p-5 text-center flex flex-col items-center justify-center relative rounded-none transition-colors ${projectFile ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border/80 bg-background hover:bg-accent/50'}`}>
                <FileArchive size={18} className={projectFile ? "text-primary mb-2 stroke-[1.5]" : "text-muted-foreground mb-2 stroke-[1.5]"} />
                <span className="text-xs font-semibold text-foreground truncate max-w-full px-2 uppercase tracking-tight">{projectFile ? projectFile.name : "Secure Project Vault"}</span>
                <span className="text-[10px] text-muted-foreground mt-1 uppercase font-medium tracking-wider">{projectFile ? `${(projectFile.size / (1024 * 1024)).toFixed(2)} MB` : "Archive core package (Max 300MB)"}</span>
                {!projectFile && (
                  <input 
                    type="file" 
                    accept=".zip,.rar,.grd,.asl,.atn" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    required 
                    onChange={e => { 
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > MAX_FILE_SIZE_BYTES) {
                          setValidationError("The project archive exceeds the maximum allowed size of 300 MB.");
                          e.target.value = "";
                          setProjectFile(null);
                        } else {
                          setValidationError(null);
                          setProjectFile(file);
                        }
                      } else {
                        setProjectFile(null);
                      }
                    }} 
                  />
                )}
                {projectFile && <button type="button" onClick={() => setProjectFile(null)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none transition-colors"><X size={12} /></button>}
              </div>
            </div>

            {previewItems.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Drag to reorder. First image is the cover.</span>
                <div className="grid grid-cols-5 gap-2 border border-border/40 p-2 bg-background/50 rounded-none">
                  {previewItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`relative aspect-square rounded-none overflow-hidden border transition-all cursor-grab active:cursor-grabbing group
                        ${dragItemIndex === idx ? 'opacity-40 border-primary scale-95' : 'border-border/40 hover:border-primary/50'}
                        ${idx === 0 ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}
                      `}
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest text-center py-0.5 z-10 pointer-events-none shadow-sm">
                          Cover
                        </div>
                      )}

                      <img 
                        src={item.previewUrl} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" 
                      />
                      
                      <button 
                        type="button" 
                        onClick={() => removePreviewFile(idx)} 
                        className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-destructive rounded-none"
                      >
                        <Trash2 size={13} className="stroke-[1.8]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-start space-x-3 bg-muted/10 p-4 border border-border/40 rounded-none">
              <Checkbox 
                id="rights-confirm" 
                checked={rightsConfirmed} 
                onCheckedChange={(checked) => setRightsConfirmed(checked as boolean)} 
                disabled={isCreatingAsset}
                className="mt-0.5 rounded-none border-border/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label 
                htmlFor="rights-confirm" 
                className="text-[11px] leading-relaxed text-muted-foreground font-medium cursor-pointer"
              >
                I confirm that I own the rights to distribute these files or have obtained the necessary licenses.
              </Label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isCreatingAsset || previewItems.length === 0 || !projectFile || !rightsConfirmed} 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase text-xs tracking-widest p-4 transition-opacity flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed rounded-none shadow-sm"
          >
            {isCreatingAsset ? (
              <><Loader2 className="animate-spin h-3.5 w-3.5 text-primary-foreground" /> Initializing node upload...</>
            ) : (
              "Deploy Asset Collection"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}