"use client"

import React, { useState } from 'react'
import { Loader2, X, Image as ImageIcon, FileArchive, Trash2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { convertToWebP } from '@/lib/imageProcessor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CREATE_COLLECTION_MUTATION = `
  mutation CreateCollection($input: CreateNewCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      success
    }
  }
`;

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

interface DeployAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  accessToken: string;
  onSuccess: () => void;
}

export function DeployAssetModal({ isOpen, onClose, userId, accessToken, onSuccess }: DeployAssetModalProps) {
  const [isCreatingAsset, setIsCreatingAsset] = useState(false)
  const [newAsset, setNewAsset] = useState({ name: "", description: "", price: "", category: "gradients" })
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValidationError(null)
      const incomingFiles = Array.from(e.target.files)
      
      setPreviewFiles((prev) => {
        const totalFiles = [...prev, ...incomingFiles]

        if (totalFiles.length > 5) {
          setValidationError("Max limit reached: Only the first 5 images will be deployed into the gallery.")
          return totalFiles.slice(0, 5)
        }
        
        return totalFiles
      })
      
      e.target.value = ""
    }
  }

  const removePreviewFile = (indexToRemove: number) => {
    setValidationError(null)
    setPreviewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleDeployCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (newAsset.description.length < 100) {
      setValidationError(`Description is too short (${newAsset.description.length}/100 symbols min). Specify pack components, version compatibility, and file resolutions.`)
      return
    }

    const numericPrice = parseFloat(newAsset.price)
    if (isNaN(numericPrice) || numericPrice < 5.00) {
      setValidationError("Minimal bundle price allowed is 5.00 USD.")
      return
    }

    if (previewFiles.length === 0 || !projectFile) {
      setValidationError("Please make sure you selected both preview gallery images and a valid project archive.")
      return
    }

    if (previewFiles.length > 5) {
      setValidationError("Gallery manifest violation: Maximum 5 preview images are allowed.")
      return
    }

    setIsCreatingAsset(true)

    try {
      const timestamp = Date.now()
      const category = newAsset.category
      const folderId = `col_${timestamp}`

      const uploadPreviewsPromises = previewFiles.map(async (file, index) => {
        const webpBlob = await convertToWebP(file, 1200, 0.82)
        const { width, height } = await getImageDimensions(webpBlob)
        
        const previewFileName = `preview_${index}_${timestamp}.webp`
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


      let calculatedMime = "zip"
      if (projectFile.name.endsWith(".rar")) calculatedMime = "rar"
      if (projectFile.name.endsWith(".7z")) calculatedMime = "seven_z"

      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: CREATE_COLLECTION_MUTATION,
          variables: {
            input: {
              name: newAsset.name,
              description: newAsset.description,
              price: numericPrice,
              videoTutorialUrl: "https://youtube.com/watch?v=placeholder", 
              tagIds: [1, 2],
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
      })

      const mutationResult = await response.json()
      if (mutationResult.errors) throw new Error(mutationResult.errors[0].message)

      setNewAsset({ name: "", description: "", price: "", category: "gradients" })
      setPreviewFiles([])
      setProjectFile(null)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("DEPLOYMENT_PROTOCOL_FAILED:", err)
      setValidationError(err.message || "An unexpected error occurred during asset package deployment.")
    } finally {
      setIsCreatingAsset(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-zinc-100 w-full max-w-lg p-8 relative rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto text-zinc-900">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors">
          <X size={18} />
        </button>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900">Deploy New Asset</h3>
          <p className="text-xs text-zinc-400 mt-1">Fill out the fields to publish your resources into the network ecosystem.</p>
        </div>
        
        {validationError && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
            {validationError}
          </div>
        )}
        
        <form onSubmit={handleDeployCollection} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Target Category</label>
            <select className="w-full border border-zinc-200 rounded-xl p-3 bg-zinc-50 outline-none text-sm transition-all focus:border-zinc-400" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
              <option value="gradients">Gradients</option>
              <option value="graphics">Graphics</option>
              <option value="actions-effects">Actions & Effects</option>
              <option value="brushes">Brushes</option>
              <option value="mockups">Mockups</option>
              <option value="textures">Textures</option>
              <option value="fonts">Fonts</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Asset Title</label>
            <input type="text" required minLength={3} maxLength={100} className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none transition-all focus:border-zinc-400" placeholder="e.g., Ultra Chrome Gradient Pack" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
              <span className={`text-[10px] font-bold ${newAsset.description.length >= 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {newAsset.description.length}/100 symbols min
              </span>
            </div>
            <textarea required rows={4} className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none transition-all focus:border-zinc-400 resize-none" placeholder="Specify pack components, compatibility, and file resolutions (minimum 100 characters)..." value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">License Price (USD)</label>
            <input type="number" step="0.01" required min="5.00" className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none transition-all focus:border-zinc-400 font-semibold" placeholder="Min 5.00" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})} />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset Media Files</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              

              <div className="border border-dashed border-zinc-200 p-4 rounded-xl bg-zinc-50/50 flex flex-col items-center justify-center text-center relative hover:bg-zinc-50 transition-colors">
                <ImageIcon size={20} className="text-zinc-400 mb-2" />
                <span className="text-xs font-medium text-zinc-600">Gallery Previews</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">{previewFiles.length} images selected</span>
                <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
              </div>

              <div className={`border p-4 rounded-xl flex flex-col items-center justify-center text-center relative transition-all ${projectFile ? 'border-zinc-300 bg-zinc-50/20' : 'border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'}`}>
                <FileArchive size={20} className={projectFile ? "text-emerald-500 mb-2" : "text-zinc-400 mb-2"} />
                <span className="text-xs font-medium text-zinc-600 truncate max-w-full px-2">{projectFile ? projectFile.name : "Secure Project Vault"}</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">{projectFile ? `${(projectFile.size / (1024 * 1024)).toFixed(2)} MB` : "Private archive node"}</span>
                {!projectFile && <input type="file" accept=".zip,.rar,.7z,.grd,.asl,.atn" className="absolute inset-0 opacity-0 cursor-pointer" required onChange={e => { setValidationError(null); setProjectFile(e.target.files?.[0] || null); }} />}
                {projectFile && <button type="button" onClick={() => setProjectFile(null)} className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 rounded-full transition-colors"><X size={14} /></button>}
              </div>

            </div>

            {previewFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2 border border-zinc-100 rounded-xl p-3 bg-zinc-50/30 max-h-32 overflow-y-auto">
                {previewFiles.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200/50 group">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePreviewFile(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isCreatingAsset || previewFiles.length === 0 || !projectFile} className="w-full bg-zinc-900 text-white rounded-xl font-semibold p-3.5 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800">
            {isCreatingAsset ? <><Loader2 className="animate-spin" size={16} /> Deploying asset node...</> : "Deploy Asset Collection"}
          </button>
        </form>
      </div>
    </div>
  )
}