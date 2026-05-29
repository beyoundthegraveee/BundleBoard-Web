"use client"

import React, { useState } from 'react'
import { Loader2, X, Image as ImageIcon, FileArchive } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CREATE_COLLECTION_MUTATION = `
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
    }
  }
`;

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
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [projectFile, setProjectFile] = useState<File | null>(null)

  if (!isOpen) return null

  const resizeAndConvertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = 500
          canvas.height = 500
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas failure"))

          const size = Math.min(img.width, img.height)
          const xIdx = (img.width - size) / 2
          const yIdx = (img.height - size) / 2

          ctx.drawImage(img, xIdx, yIdx, size, size, 0, 0, 500, 500)

          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error("Serialization error")),
            "image/webp",
            0.85
          )
        }
      }
      reader.onerror = (err) => reject(err)
    })
  }

  const handleDeployCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewFile || !projectFile) return

    setIsCreatingAsset(true)

    try {
      const timestamp = Date.now()
      const category = newAsset.category

      const optimizedImg = await resizeAndConvertToWebP(previewFile)
      const previewPath = `${category}/previews_${userId}_${timestamp}.webp`
      const { error: pError } = await supabase.storage
        .from("previews")
        .upload(previewPath, optimizedImg, { contentType: "image/webp" })
      if (pError) throw pError
      const { data: { publicUrl } } = supabase.storage.from("previews").getPublicUrl(previewPath)

      const archivePath = `${category}/node_${userId}_${timestamp}_${projectFile.name}`
      const { error: vError } = await supabase.storage
        .from("vault")
        .upload(archivePath, projectFile)
      if (vError) throw vError

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
              price: parseFloat(newAsset.price),
              previewImageUrl: publicUrl,
              previewFileName: previewFile.name,
              projectFilePath: archivePath,
              projectFileName: projectFile.name,
              projectFileSize: projectFile.size,
              projectMimeType: projectFile.type || "application/zip"
            }
          }
        })
      })

      const mutationResult = await response.json()
      if (mutationResult.errors) throw new Error(mutationResult.errors[0].message)

      setNewAsset({ name: "", description: "", price: "", category: "gradients" })
      setPreviewFile(null)
      setProjectFile(null)
      onSuccess()
      onClose()
    } catch (err) {
      console.error("DEPLOYMENT_PROTOCOL_FAILED:", err)
    } finally {
      setIsCreatingAsset(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg p-6 relative shadow-[16px_16px_0px_rgba(239,68,68,1)] max-h-[90vh] overflow-y-auto font-mono text-black">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-black hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 text-red-600">Deploy_Asset_Protocol</h3>
        
        <form onSubmit={handleDeployCollection} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Target_Category</label>
            <select 
              className="w-full border-2 border-black p-2 font-black bg-zinc-50 outline-none text-xs uppercase"
              value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}
            >
              <option value="gradients">Gradients</option>
              <option value="layer-styles">Layer Styles</option>
              <option value="actions-effects">Actions & Effects</option>
              <option value="brushes">Brushes</option>
              <option value="mockups">Mockups</option>
              <option value="textures">Textures</option>
              <option value="fonts">Fonts</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Asset_Title</label>
            <input 
              type="text" required
              className="w-full border-2 border-black p-2 font-bold focus:bg-zinc-50 outline-none uppercase text-xs"
              placeholder="E.G., ACIDS_GRADIENTS_PACK"
              value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Description_Log</label>
            <textarea 
              required rows={3}
              className="w-full border-2 border-black p-2 font-bold focus:bg-zinc-50 outline-none text-xs resize-none"
              placeholder="SPECIFY_PACK_COMPONENTS_AND_PHOTOSHOP_VERSIONS"
              value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">License_Price_(USD)</label>
            <input 
              type="number" step="0.01" required min="0"
              className="w-full border-2 border-black p-2 font-black focus:bg-zinc-50 outline-none font-mono"
              placeholder="0.00"
              value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-3 bg-zinc-50 relative">
              <span className="text-[10px] font-black uppercase block mb-2">1. Frame_Preview</span>
              <label className="flex items-center justify-center gap-2 cursor-pointer border border-black bg-white p-2 text-[11px] font-black uppercase hover:bg-black hover:text-white transition-colors">
                <ImageIcon size={14} /> Select
                <input type="file" accept="image/*" className="hidden" required onChange={e => setPreviewFile(e.target.files?.[0] || null)} />
              </label>
              {previewFile && <p className="text-[8px] mt-1 truncate font-bold text-green-600">✓ {previewFile.name}</p>}
            </div>

            <div className="border-2 border-black p-3 bg-zinc-50 relative">
              <span className="text-[10px] font-black uppercase block mb-2">2. Secure_Archive</span>
              <label className="flex items-center justify-center gap-2 cursor-pointer border border-black bg-white p-2 text-[11px] font-black uppercase hover:bg-black hover:text-white transition-colors">
                <FileArchive size={14} /> Select
                <input type="file" accept=".zip,.rar,.7z,.grd,.asl,.atn" className="hidden" required onChange={e => setProjectFile(e.target.files?.[0] || null)} />
              </label>
              {projectFile && <p className="text-[8px] mt-1 truncate font-bold text-green-600">✓ {projectFile.name}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isCreatingAsset}
            className="w-full bg-black text-white border-2 border-black font-black uppercase p-4 text-xs tracking-wider shadow-[4px_4px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreatingAsset ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Syncing_Network_Nodes...
              </>
            ) : (
              "Execute_Asset_Deployment"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}