"use client"

import React, { useState } from 'react'
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMutation } from "@apollo/client/react"
import { ToggleFavoriteDocument } from "@/graphql/generated"

interface LikeButtonProps {
  collectionId: string;
  initialLiked?: boolean;
  onToggle?: (isLiked: boolean) => void; 
}

export default function LikeButton({ collectionId, initialLiked = false, onToggle }: LikeButtonProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isAnimating, setIsAnimating] = useState(false)
  const [executeToggleFavorite] = useMutation(ToggleFavoriteDocument)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!session) {
      alert("System Notice: Authentication required to save to favorites.")
      return
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)

    if (onToggle) {
      onToggle(newLikedState);
    }

    try {
      await executeToggleFavorite({
        variables: { collectionId }
      })
      
    } catch (error) {
      setIsLiked(!newLikedState)
      if (onToggle) {
        onToggle(!newLikedState);
      }
      console.error("Failed to toggle like in database", error)
    }
  }

  return (
    <button 
      onClick={handleLike}
      className={`flex items-center justify-center w-11 h-11 border transition-all duration-200 rounded-none shrink-0 ${
        isLiked 
          ? 'border-red-500/50 bg-red-500/10 text-red-500' 
          : 'border-border/60 bg-background hover:border-primary text-muted-foreground'
      } ${isAnimating ? 'scale-110' : 'scale-100'}`}
      title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} className="transition-all" />
    </button>
  )
}