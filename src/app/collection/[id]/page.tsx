"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from "lucide-react"
import CollectionDetails from '@/components/CollectionDetails'
import AuthorSidebar from '@/components/AuthorSidebar'
import CommentsSection from '@/components/CommentSection'
import { useQuery } from '@apollo/client/react'
import { GetCollectionDocument } from '@/graphql/generated'
import { AuroraBackground } from '@/components/ui/aurora-background'

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

  const collection = data?.getCollectionById;

  useEffect(() => {
    if (typeof window !== 'undefined' && collectionId) {
      const savedCart = localStorage.getItem('bundleboard_cart')
      if (savedCart) {
        const items = JSON.parse(savedCart)
        setIsInCart(items.some((item: any) => item.id === collectionId))
      }
    }
  }, [collectionId])

  const handleAddToCart = (item: { id: string; name: string; price: number; category: string; previewImage: string }) => {
    if (typeof window !== 'undefined') {
      const currentCart = localStorage.getItem('bundleboard_cart')
      const items = currentCart ? JSON.parse(currentCart) : []
      
      if (!items.some((cartItem: any) => cartItem.id === item.id)) {
        const updatedCart = [...items, item]
        localStorage.setItem('bundleboard_cart', JSON.stringify(updatedCart))
        setIsInCart(true)
        window.dispatchEvent(new Event('cartUpdate'))
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center font-sans font-semibold uppercase text-xs tracking-widest text-destructive bg-background">
      Error: Asset catalog node not found {error && `// ${error.message}`}
    </div>
  )

  return (
    // 💡 ИЗМЕНЕНИЯ ЗДЕСЬ: добавлены min-h-[calc(100vh-5rem)], h-full и увеличен pb-24 для правильного скроллинга
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