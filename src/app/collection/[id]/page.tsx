"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import CollectionDetails from '@/components/collectionActions/CollectionDetails'
import AuthorSidebar from '@/components/collectionActions/AuthorSidebar'
import CommentsSection from '@/components/collectionActions/CommentSection'
import { useQuery } from '@apollo/client/react'
import { GetCollectionDocument } from '@/graphql/generated'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { toast } from 'sonner'

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  previewImage: string;
}

export default function CollectionPage() {
  const { id } = useParams()
  const router = useRouter()
  const collectionId = Array.isArray(id) ? id[0] : id || "";
  const [isInCart, setIsInCart] = useState(false)
  
  const { data, loading, error } = useQuery(GetCollectionDocument, {
    variables: { id: collectionId },
    skip: !collectionId,
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to retrieve asset data.");
    }
  }, [error]);

  const collection = data?.getCollectionById;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (typeof window !== 'undefined' && collectionId) {
      try {
        const savedCart = localStorage.getItem('bundleboard_cart')
        if (savedCart) {
          const items: CartItem[] = JSON.parse(savedCart)
          const isSaved = items.some((item) => item.id === collectionId)
          
          timer = setTimeout(() => {
            setIsInCart((prev) => (prev === isSaved ? prev : isSaved))
          }, 0)
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [collectionId])

  const handleAddToCart = (item: CartItem) => {
    if (typeof window !== 'undefined') {
      try {
        const currentCart = localStorage.getItem('bundleboard_cart')
        const items: CartItem[] = currentCart ? JSON.parse(currentCart) : []
      
        if (!items.some((cartItem) => cartItem.id === item.id)) {
          const updatedCart = [...items, item]
          localStorage.setItem('bundleboard_cart', JSON.stringify(updatedCart))
          setIsInCart(true)
          window.dispatchEvent(new Event('cartUpdate'))
          toast.success("Asset added to cart")
        }
      } catch (error) {
        toast.error("Failed to add item to cart");
        console.error("Failed to add item to cart", error)
      }
    }
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
      <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
      <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Accessing asset parameters...</span>
    </div>
  )

  if (error || !collection) return (
    <AuroraBackground className="text-foreground font-sans p-6 md:p-10 lg:p-16 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="border border-dashed border-border/60 p-12 text-center bg-card/20 backdrop-blur-sm max-w-md w-full flex flex-col items-center relative z-10 rounded-none shadow-xl">
        <AlertTriangle size={24} className="text-muted-foreground/50 mb-4" />
        <div className="font-semibold uppercase text-muted-foreground text-xs tracking-widest mb-6">
          Asset offline or destroyed
        </div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase border border-border/80 px-4 py-2 bg-background hover:bg-accent tracking-wider transition-colors rounded-none"
        >
          <ArrowLeft size={13} /> Return to Directory
        </button>
      </div>
    </AuroraBackground>
  )

  return (
    <AuroraBackground className="text-foreground font-sans p-6 md:p-10 lg:p-16 pb-24 min-h-[calc(100vh-5rem)] h-full justify-start items-stretch">
      <nav className="mb-14 border-b border-border/40 pb-5 flex justify-between items-center relative z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2.5 font-semibold uppercase text-[11px] tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-px transition-transform" /> 
          Back to catalog
        </button>
        <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest text-muted-foreground">
          Catalog Item Reference // {collectionId}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
        <div className="lg:col-span-8 space-y-12">
          <CollectionDetails 
            collection={collection} 
            onAddToCart={handleAddToCart}
            isInCart={isInCart}
          />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
             <AuthorSidebar author={collection.author} />
             <CommentsSection 
               targetId={collectionId} 
               authorUsername={collection.author?.username} 
             />
          </div>
        </div>
      </div>
      
    </AuroraBackground>
  )
}