"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { GetCollectionBySlugQuery } from '@/graphql/generated'

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  previewImage: string;
  ownerId: string;
}

type CollectionData = GetCollectionBySlugQuery['getCollectionBySlug']

export function useCollectionInteractions(collection: CollectionData | undefined, collectionId: string) {
  const [isInCart, setIsInCart] = useState(false)
  const { data: session } = useSession()

  const isOwner = useMemo(() => {
    if (!session?.user?.id || !collection?.author?.userId) return false
    return String(session.user.id) === String(collection.author.userId)
  }, [session, collection])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

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
        console.error("Failed to parse cart from localStorage", error)
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [collectionId])

  const handleAddToCart = (item: Omit<CartItem, 'ownerId'>) => {
    if (isOwner) {
      toast.error("You cannot add your own collection to the cart.")
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const currentCart = localStorage.getItem('bundleboard_cart')
        const items: CartItem[] = currentCart ? JSON.parse(currentCart) : []

        if (!items.some((cartItem) => cartItem.id === item.id)) {
          const itemWithOwner: CartItem = {
            ...item,
            ownerId: String(collection?.author?.userId || "")
          }
          const updatedCart = [...items, itemWithOwner]
          localStorage.setItem('bundleboard_cart', JSON.stringify(updatedCart))
          setIsInCart(true)
          window.dispatchEvent(new Event('cartUpdate'))
          toast.success("Asset added to cart")
        }
      } catch (error) {
        toast.error("Failed to add item to cart")
        console.error("Failed to add item to cart", error)
      }
    }
  }

  return { isInCart, isOwner, handleAddToCart }
}