"use client"
import React, { useState } from 'react'
import { Loader2, User, Upload } from "lucide-react"
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
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas failure"))

        const size = Math.min(img.width, img.height)
        const xIdx = (img.width - size) / 2
        const yIdx = (img.height - size) / 2

        ctx.drawImage(img, xIdx, yIdx, size, size, 0, 0, 200, 200)
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


  return (
    <div className="flex items-center gap-5 mb-6 pt-2">
      <div className="relative h-16 w-16 border border-border/80 rounded-none bg-muted shrink-0 overflow-hidden">
        {userData?.avatarUrl ? (
          <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
            <User size={24} strokeWidth={1.5} />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
            <Loader2 className="animate-spin text-primary" size={16} />
          </div>
        )}
      </div>

      <label className="flex items-center justify-center gap-2 border border-border/80 bg-background text-foreground p-2.5 hover:bg-accent font-semibold text-[10px] uppercase tracking-wider cursor-pointer transition-colors rounded-none">
        <Upload size={12} className="stroke-[1.8]" /> 
        {isUploading ? "Syncing..." : "Update Photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
      </label>
    </div>
  )
}