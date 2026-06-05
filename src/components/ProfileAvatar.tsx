"use client"
import { useState } from 'react'
import { Loader2, User, Upload } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'

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

const UPDATE_AVATAR_MUTATION = `
  mutation UpdateAvatar($input: UpdateAvatarRequest!) {
    updateAvatar(input: $input) {
      id
      avatarUrl
      updatedAt
    }
  }
`;

export function ProfileAvatar({ userData, accessToken, onUpdate }: { userData: any, accessToken: string, onUpdate: () => void }) {
  const [isUploading, setIsUploading] = useState(false)

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

      const { data: { publicUrl } } = supabase.storage
        .from("previews")
        .getPublicUrl(fileName)

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: UPDATE_AVATAR_MUTATION,
          variables: { input: { id: userData.id, avatarUrl: publicUrl } }
        })
      })

      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)
      onUpdate()
      
    } catch (err) {
      console.error("AVATAR_UPLOAD_FAILURE:", err)
      alert("Failed to update avatar")
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
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-primary" size={16} />
          </div>
        )}
      </div>
      
      <label className="cursor-pointer border border-border/80 p-2.5 hover:bg-accent text-[10px] uppercase tracking-wider transition-colors">
        <Upload size={12} className="inline mr-2" />
        {isUploading ? "Syncing..." : "Update Photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
      </label>
    </div>
  )
}