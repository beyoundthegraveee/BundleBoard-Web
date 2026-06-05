"use client"
import React, { useState } from 'react'
import { Heart } from "lucide-react"

export default function LikeButton({ collectionId, initialLiked = false }: { collectionId: string, initialLiked?: boolean }) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async () => {
    setIsLiked(!isLiked)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)

    try {
    } catch (error) {
      setIsLiked(!isLiked)
      console.error("Failed to toggle like", error)
    }
  }

  return (
    <button 
      onClick={handleLike}
      className={`p-2 border transition-all duration-200 ${
        isLiked 
          ? 'border-red-500/50 bg-red-500/10 text-red-500' 
          : 'border-border/60 bg-background hover:border-primary text-muted-foreground'
      } ${isAnimating ? 'scale-110' : 'scale-100'}`}
      title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
    >
      <Heart size={14} fill={isLiked ? "currentColor" : "none"} className="transition-all" />
    </button>
  )
}