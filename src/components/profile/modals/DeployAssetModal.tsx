import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Loader2, X, Image as ImageIcon, FileArchive, Trash2, Link as LinkIcon, DollarSign, Gift } from "lucide-react"
import { useSupabase } from '@/components/provider/SupabaseProvider'
import { convertToWebP } from '@/lib/imageProcessor'
import { MAX_FILE_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES, EXTERNAL_URL_REGEX, ALLOWED_EXTENSIONS } from '@/lib/constants'
import { useMutation } from "@apollo/client/react"
import { CreateCollectionDocument } from '@/graphql/generated'
import type { MimeType, ImageShortInput, CreateNewCollectionInput, MediaResourceInput, Provider } from '@/graphql/generated'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'

const getImageDimensions = (blob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new window.Image();
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

const CATEGORY_TO_TAG_ID: Record<string, string> = {
  "brushes": "1",
  "fonts": "2",
  "gradients": "3",
  "graphics": "4",
  "textures": "5",
  "mockups": "6",
  "actions-effects": "7"
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

interface AssetDraftState {
  name: string;
  description: string;
  category: string;
}

export function DeployAssetModal({ isOpen, onClose, onSuccess }: DeployAssetModalProps) {
  const supabase = useSupabase()
  const [isCreatingAsset, setIsCreatingAsset] = useState<boolean>(false)
  
  const [isFree, setIsFree] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("draft_isFree") === "true";
    }
    return false;
  });
  const [price, setPrice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("draft_price") || "";
    }
    return "";
  });

  const [newAsset, setNewAsset] = useState<AssetDraftState>(() => {
    if (typeof window !== 'undefined') {
      const draft = sessionStorage.getItem("draft_newAsset");
      if (draft) return JSON.parse(draft) as AssetDraftState;
    }
    return { name: "", description: "", category: "gradients" };
  });

  const [uploadMode, setUploadMode] = useState<'hosted' | 'external'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem("draft_uploadMode") as 'hosted' | 'external') || 'hosted';
    }
    return 'hosted';
  });

  const [externalLink, setExternalLink] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("draft_externalLink") || "";
    }
    return "";
  });
  
  const [previewItems, setPreviewItems] = useState<PreviewFileItem[]>([])
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)
  const [rightsConfirmed, setRightsConfirmed] = useState<boolean>(false)

  const [executeCreate] = useMutation(CreateCollectionDocument)

  useEffect(() => {
    sessionStorage.setItem("draft_newAsset", JSON.stringify(newAsset))
    sessionStorage.setItem("draft_uploadMode", uploadMode)
    sessionStorage.setItem("draft_externalLink", externalLink)
    sessionStorage.setItem("draft_isFree", String(isFree))
    sessionStorage.setItem("draft_price", price)
  }, [newAsset, uploadMode, externalLink, isFree, price])

  const previewItemsRef = useRef<PreviewFileItem[]>(previewItems);
  useEffect(() => {
    previewItemsRef.current = previewItems;
  }, [previewItems]);

  useEffect(() => {
    return () => {
      previewItemsRef.current.forEach(item => URL.revokeObjectURL(item.previewUrl));
    }
  }, []);

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValidationError(null)
      const incomingFiles = Array.from(e.target.files)
      const oversized = incomingFiles.find(f => f.size > MAX_IMAGE_SIZE_BYTES);

      if (oversized) {
        setValidationError(`Preview images must be under 10 MB.`);
        e.target.value = "";
        return;
      }
      
      setPreviewItems((prev) => {
        const currentTotal = prev.length + incomingFiles.length;
        const timestamp = Date.now();

        if (currentTotal > 5) {
          setValidationError("Maximum 5 gallery preview images are allowed. Please remove some files first.")
          const availableSlots = 5 - prev.length;
          const allowedFiles = incomingFiles.slice(0, availableSlots);
          const newItems = allowedFiles.map((file, idx) => ({
            id: `deploy-new-${file.name}-${file.size}-${timestamp}-${idx}`,
            file,
            previewUrl: URL.createObjectURL(file)
          }))
          return [...prev, ...newItems];
        }

        const newItems = incomingFiles.map((file, idx) => ({
          id: `deploy-new-${file.name}-${file.size}-${timestamp}-${idx}`,
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

    const finalPrice = isFree ? 0 : parseFloat(price);
    if (!isFree && (isNaN(finalPrice) || finalPrice < 5 || finalPrice > 100)) {
      setValidationError("Pricing protocol violation: Commercial value must be between $5.00 and $100.00 USD.");
      return;
    }

    if (newAsset.name.trim().length > 50) {
      setValidationError(`Asset title must not exceed 50 characters (${newAsset.name.length}/50).`);
      return;
    }

    if (newAsset.description.length < 100 || newAsset.description.length > 1000) {
      setValidationError(`Description length must be between 100 and 1000 characters (${newAsset.description.length}/1000).`)
      return
    }

    if (previewItems.length === 0) {
      setValidationError("Visual payload incomplete. Upload at least one gallery preview.")
      return
    }

    if (uploadMode === 'hosted') {
      if (!projectFile) {
        setValidationError("Deployment manifest incomplete. Upload a secure project archive.")
        return
      }
    } else if (uploadMode === 'external') {
      if (!externalLink || !externalLink.trim()) {
        setValidationError("Deployment manifest incomplete. Provide a valid external download link.")
        return
      }
      if (externalLink.trim().length > 512) {
        setValidationError(`External link length must not exceed 512 characters (${externalLink.trim().length}/512).`);
        return;
      }
      if (!EXTERNAL_URL_REGEX.test(externalLink.trim())) {
        setValidationError("Invalid URL format. Please provide a valid external link (e.g., https://example.com/...).")
        return
      }
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
          mimeType: "webp" as MimeType,
          width: width,
          height: height,
          fileSize: webpBlob.size
        }
      })

      const uploadedImages = await Promise.all(uploadPreviewsPromises)
      
      let mediaResourceData: MediaResourceInput | null = null;
      
      if (uploadMode === 'hosted' && projectFile) {
        const archivePath = `${category}/${folderId}/${projectFile.name}`
        const { error: vError } = await supabase.storage
          .from("vault")
          .upload(archivePath, projectFile)
          
        if (vError) throw vError
        
        const ext = projectFile.name.split('.').pop()?.toLowerCase();
        let calculatedMime: MimeType = "zip";
        if (ext === "rar") calculatedMime = "rar";
        else if (ext === "pdf") calculatedMime = "pdf";
        else if (ext === "mp4") calculatedMime = "mp4";
        else if (ext === "png") calculatedMime = "png";
        else if (ext === "webp") calculatedMime = "webp";
        else if (ext === "jpg" || ext === "jpeg") calculatedMime = "jpeg";
        
        mediaResourceData = {
          fileName: projectFile.name,
          filePath: archivePath,
          mimeType: calculatedMime,
          provider: "local" as Provider,
          fileSize: projectFile.size
        }
      }

      const selectedTagId = CATEGORY_TO_TAG_ID[newAsset.category] || "1";
      
      const createInput: CreateNewCollectionInput = {
        name: newAsset.name,
        description: newAsset.description,
        price: finalPrice,
        videoTutorialUrl: `https://youtube.com/watch?v=placeholder-${timestamp}`,
        tagIds: [selectedTagId],
        galleryImages: uploadedImages
      }

      if (uploadMode === 'hosted' && mediaResourceData) {
        createInput.mediaResource = mediaResourceData;
      } else if (uploadMode === 'external') {
        createInput.externalLink = externalLink.trim();
      }

      await executeCreate({
        variables: {
          input: createInput
        }
      })

      setNewAsset({ name: "", description: "", category: "gradients" })
      setPrice("")
      setIsFree(false)
      setPreviewItems([])
      setProjectFile(null)
      setExternalLink("")
      setRightsConfirmed(false)
      
      sessionStorage.removeItem("draft_newAsset")
      sessionStorage.removeItem("draft_uploadMode")
      sessionStorage.removeItem("draft_externalLink")
      sessionStorage.removeItem("draft_isFree")
      sessionStorage.removeItem("draft_price")

      onSuccess()
      onClose()
    } catch (err: unknown) {
      console.error("CATALOG_DEPLOYMENT_FAILURE:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected system variation occurred during asset compilation.";
      setValidationError(errorMessage)
    } finally {
      setIsCreatingAsset(false)
    }
  }

  const isSubmitDisabled = isCreatingAsset || 
                           previewItems.length === 0 || 
                           !rightsConfirmed || 
                           (uploadMode === 'hosted' && !projectFile) || 
                           (uploadMode === 'external' && !externalLink.trim()) ||
                           (!isFree && !price);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="bg-card border border-border/60 w-full max-w-lg p-5 sm:p-8 relative rounded-none shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar text-foreground">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-none"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.8]" />
        </button>
        
        <div className="mb-5 sm:mb-6 border-b border-border/40 pb-3 sm:pb-4 pr-6">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground uppercase">Deploy Asset Manifest</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-normal">Submit asset components to initialize public directory node.</p>
        </div>
        
        {validationError && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-destructive/5 border border-destructive/20 text-destructive text-[10px] sm:text-xs font-semibold uppercase tracking-wide rounded-none whitespace-pre-wrap">
            {validationError}
          </div>
        )}
        
        <form onSubmit={handleDeployCollection} className="space-y-4 sm:space-y-5">
          
          <div className="space-y-2">
            <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pricing Protocol</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/10 border border-border/40">
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={cn(
                  "py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all rounded-none",
                  !isFree ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DollarSign size={12} /> Commercial
              </button>
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={cn(
                  "py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all rounded-none",
                  isFree ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Gift size={12} /> Open Source
              </button>
            </div>
          </div>

          {!isFree ? (
            <div className="grid gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-baseline">
                <label htmlFor="modal-price" className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Price (USD)</label>
                <span className="text-[8px] font-bold text-destructive uppercase tracking-wide">Limit: $5.00 - $100.00</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                <input 
                  type="number"
                  id="modal-price"
                  step="0.01"
                  min="5"
                  max="100"
                  required={!isFree}
                  placeholder="5.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border border-border/60 bg-background text-foreground rounded-none p-2.5 pl-7 text-xs sm:text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/30"
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-muted/5 border border-dashed border-border/40 text-center text-[9px] font-bold text-primary uppercase tracking-widest animate-in fade-in duration-200">
              Extra Zero-Value Asset Bypass Active. Direct distribution setup.
            </div>
          )}

          <div className="grid gap-1">
            <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target Category</label>
            <select 
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-2.5 sm:p-3 outline-none text-xs sm:text-sm font-normal transition-all focus:border-primary" 
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

          <div className="grid gap-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Title</label>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-bold tracking-wide uppercase",
                newAsset.name.length >= 50 ? 'text-destructive' : 'text-primary'
              )}>
                {newAsset.name.length} / 50
              </span>
            </div>
            <input 
              type="text" 
              required 
              minLength={3} 
              maxLength={50} 
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-2.5 sm:p-3 text-xs sm:text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/40" 
              placeholder="e.g., Ultra Chrome Gradient Pack" 
              value={newAsset.name} 
              onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
            />
          </div>

          <div className="grid gap-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <span className={`text-[9px] sm:text-[10px] font-bold tracking-wide uppercase ${
                newAsset.description.length < 100 ? 'text-amber-500' : 
                newAsset.description.length >= 1000 ? 'text-destructive' : 'text-primary'
              }`}>
                {newAsset.description.length} / 1000
              </span>
            </div>
            <textarea 
              required 
              rows={3} 
              maxLength={1000}
              className="w-full border border-border/60 bg-background text-foreground rounded-none p-2.5 sm:p-3 text-xs sm:text-sm font-normal outline-none transition-all focus:border-primary placeholder:text-muted-foreground/40 resize-none leading-relaxed" 
              placeholder="Specify bundle details, file dimensions, and software compatibility versions..." 
              value={newAsset.description} 
              onChange={e => setNewAsset({...newAsset, description: e.target.value})} 
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Visual Payload (Max 10MB per image)</label>
              <span className={`text-[8px] sm:text-[9px] font-bold uppercase ${previewItems.length === 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                {previewItems.length} / 5 Images
              </span>
            </div>
            
            <div className={`border border-dashed p-4 sm:p-5 text-center flex flex-col items-center justify-center relative transition-colors rounded-none ${previewItems.length >= 5 ? 'border-border/40 bg-muted/10 cursor-not-allowed opacity-50' : 'border-border/80 bg-background hover:bg-accent/50 cursor-pointer group'}`}>
              <ImageIcon size={16} className="text-muted-foreground mb-1.5 stroke-[1.5]" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 uppercase font-medium tracking-wider">
                {previewItems.length >= 5 ? 'Limit reached' : `Select up to 5 gallery images`}
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

            {previewItems.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Drag to reorder. First image is the cover.</span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 border border-border/40 p-1.5 sm:p-2 bg-background/50 rounded-none">
                  {previewItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={cn(
                        "relative aspect-square rounded-none overflow-hidden border transition-all cursor-grab active:cursor-grabbing group",
                        dragItemIndex === idx ? 'opacity-40 border-primary scale-95' : 'border-border/40 hover:border-primary/50',
                        idx === 0 ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''
                      )}
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-center py-0.5 z-10 pointer-events-none shadow-sm">
                          Cover
                        </div>
                      )}

                      <Image 
                        src={item.previewUrl} 
                        alt="" 
                        fill
                        unoptimized
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" 
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

          <div className="space-y-2.5 pt-3 border-t border-border/20">
            <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Distribution Method</label>
            <div className="flex bg-muted/20 border border-border/40 p-1">
              <button 
                type="button"
                onClick={() => {
                  setUploadMode('hosted')
                  setExternalLink("")
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${uploadMode === 'hosted' ? 'bg-background border border-border/80 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
              >
                <FileArchive size={12} className="stroke-[1.8] sm:h-3.5 sm:w-3.5" /> Hosted Archive
              </button>
              <button 
                type="button"
                onClick={() => {
                  setUploadMode('external')
                  setProjectFile(null)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${uploadMode === 'external' ? 'bg-background border border-border/80 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
              >
                <LinkIcon size={12} className="stroke-[1.8] sm:h-3.5 sm:w-3.5" /> External Link
              </button>
            </div>

            {uploadMode === 'hosted' ? (
              <div className={`border p-4 sm:p-5 text-center flex flex-col items-center justify-center relative rounded-none transition-colors ${projectFile ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border/80 bg-background hover:bg-accent/50'}`}>
                <FileArchive size={16} className={projectFile ? "text-primary mb-1.5 stroke-[1.5]" : "text-muted-foreground mb-1.5 stroke-[1.5]"} />
                <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate max-w-full px-2 uppercase tracking-tight">{projectFile ? projectFile.name : "Secure Project Vault"}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 uppercase font-medium tracking-wider">{projectFile ? `${(projectFile.size / (1024 * 1024)).toFixed(2)} MB` : "Archive core package (Max 300MB)"}</span>
                {!projectFile && (
                  <input 
                    type="file" 
                    accept=".zip,.rar,.pdf,.jpeg,.jpg,.png,.webp,.mp4" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={e => { 
                      const file = e.target.files?.[0];
                      if (file) {
                        const fileExt = file.name.split('.').pop()?.toLowerCase();
                        
                        if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
                          setValidationError(`Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}.`);
                          e.target.value = "";
                          setProjectFile(null);
                          return;
                        }

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
            ) : (
              <div className="grid gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={14} className="text-muted-foreground" />
                  </div>
                  <input 
                    type="url" 
                    required
                    maxLength={512}
                    placeholder="https://..." 
                    value={externalLink}
                    onChange={e => setExternalLink(e.target.value)}
                    className="w-full bg-background border border-border/60 py-2.5 sm:py-3 pl-9 pr-3 text-xs sm:text-sm text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Users will be redirected to this link to download the asset.</p>
                  <span className={cn(
                    "text-[9px] font-bold tracking-wide uppercase",
                    externalLink.length >= 512 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {externalLink.length} / 512
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-1">
            <div className="flex items-start space-x-2.5 sm:space-x-3 bg-muted/10 p-3 sm:p-4 border border-border/40 rounded-none">
              <Checkbox 
                id="rights-confirm" 
                checked={rightsConfirmed} 
                onCheckedChange={(checked) => setRightsConfirmed(checked as boolean)} 
                disabled={isCreatingAsset}
                className="mt-0.5 rounded-none border-border/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label 
                htmlFor="rights-confirm" 
                className="text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground font-medium cursor-pointer"
              >
                I confirm that I own the rights to distribute these files or have obtained the necessary licenses.
              </Label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitDisabled} 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase text-[11px] sm:text-xs tracking-widest p-3.5 sm:p-4 transition-opacity flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed rounded-none shadow-sm"
          >
            {isCreatingAsset ? (
              <><Loader2 className="animate-spin h-3.5 w-3.5 text-primary-foreground" /> Deploying Node Payload...</>
            ) : (
              "Commit Changes & Execute Deployment"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}