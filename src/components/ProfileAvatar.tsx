"use client"

import React, { useState } from 'react'
import { Loader2, User, Upload, Shield, Zap, Hash } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'

import { useMutation } from "@apollo/client/react"
import { UpdateAvatarDocument, GetUserProfileQuery } from "@/graphql/generated"

interface ProfileAvatarProps {
  userData?: GetUserProfileQuery['getUserProfile'] | null; 
  onUpdate: () => void;
}

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
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Error")), "image/webp", 0.85)
      }
    }
    reader.onerror = (err) => reject(err)
  })
}

export function ProfileAvatar({ userData, onUpdate }: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [executeUpdateAvatar] = useMutation(UpdateAvatarDocument)

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData?.id) return

    setIsUploading(true)
    try {
      const processedBlob = await resizeAndConvertToWebP(file)
      const fileName = `avatars/${userData.id}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from("previews")
        .upload(fileName, processedBlob, { contentType: "image/webp", upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("previews").getPublicUrl(fileName)
      
      await executeUpdateAvatar({
        variables: { 
          input: { 
            id: userData.id, 
            avatarUrl: publicUrl 
          } 
        }
      })
      
      onUpdate()
    } catch (err: any) {
      console.error("AVATAR_UPLOAD_FAILURE:", err.message || err)
    } finally {
      setIsUploading(false)
    }
  }

  const isAuthor = userData?.roles?.includes("author")

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-5 pt-2 w-full mb-6">
      
      {/* ЛЕВАЯ КОЛОНКА (Фиксированная ширина w-40, аватар всегда квадратный) */}
      <div className="flex flex-col gap-3 w-full sm:w-40 shrink-0">
        <div className="relative w-full aspect-square border border-border/80 rounded-none bg-muted overflow-hidden shadow-sm">
          {userData?.avatarUrl ? (
            <img src={userData.avatarUrl} alt="avatar" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
              <User size={48} strokeWidth={1.2} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          )}
        </div>
        
        <label className="flex items-center justify-center gap-2 border border-border/80 bg-background text-foreground w-full py-2.5 hover:bg-accent font-semibold text-[10px] uppercase tracking-wider cursor-pointer transition-colors rounded-none shadow-sm shrink-0">
          <Upload size={12} className="stroke-[1.8]" /> 
          {isUploading ? "Syncing..." : "Update"}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
        </label>
      </div>

      {/* ПРАВАЯ КОЛОНКА (min-w-0 предотвращает наложение длинного текста) */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
        
        <div className="mb-3">
          <h2 className="text-2xl font-bold uppercase tracking-tight leading-none text-foreground font-display mb-1.5 truncate">
            {userData?.username || "Guest Node"}
          </h2>
          <p className="text-[11px] font-medium tracking-tight text-muted-foreground/90 lowercase border-b border-border/30 pb-2 truncate">
            {userData?.email}
          </p>
        </div>

        {/* ПЛАШКИ (Сделаны короче и компактнее через p-2) */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1 font-mono">
            System Registry // Identity
          </span>
          
          <div className="flex items-center gap-2.5 border border-border/40 p-2 bg-card/40 rounded-none w-full shadow-sm">
            <Zap size={13} className="text-primary stroke-[1.8]" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Node status</span>
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-tight truncate">{userData?.status || 'ACTIVE'}</span> 
            </div>
          </div>

          <div className="flex items-center gap-2.5 border border-border/40 p-2 bg-card/40 rounded-none w-full shadow-sm">
            <Shield size={13} className="text-primary stroke-[1.8]" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Verified Rights</span>
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-tight truncate">
                {isAuthor ? "PLATFORM PARTNER" : "STANDARD CLIENT"}
              </span> 
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 border border-border/40 p-2 bg-card/40 rounded-none w-full shadow-sm">
            <Hash size={13} className="text-muted-foreground stroke-[1.8]" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Access Key ID</span>
              <span className="text-[11px] font-medium text-foreground truncate font-mono">
                {userData?.id ? `${userData.id.padStart(4, '0')}` : "UNVERIFIED"}
              </span> 
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}