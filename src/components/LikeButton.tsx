"use client"

import React, { useState } from 'react'
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"

interface LikeButtonProps {
  collectionId: string;
  initialLiked?: boolean;
  onToggle?: (isLiked: boolean) => void; 
}

export default function LikeButton({ collectionId, initialLiked = false, onToggle }: LikeButtonProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!session || !(session as any).accessToken) {
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
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify({
          query: `
            mutation ToggleFavorite($collectionId: ID!) {
              toggleFavorite(collectionId: $collectionId)
            }
          `,
          variables: { collectionId }
        })
      })
      
      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)
      
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