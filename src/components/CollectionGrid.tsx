"use client"

import React, { useEffect, useState } from 'react'
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Collection {
  id: string;
  name: string;
  description: string;
  price: number;
  previewImage: {
    filePath: string;
  };
  author: {
    id: string;
    rating: number;
  };
}

export const GET_ALL_COLLECTIONS = `
  mutation GetAllCollections {
    getAllCollections {
      id
      name
      description
      price
      author {
        id
        rating
      }
      previewImage {
        filePath
      }
    }
  }
`;

export function CollectionGrid() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: GET_ALL_COLLECTIONS,
          }),
        })

        const result = await response.json()
        if (result.errors) throw new Error(result.errors[0].message)
        
        setCollections(result.data?.getAllCollections || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center p-20">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  )

  if (error) return (
    <div className="text-red-500 text-center p-10 font-bold border border-red-200 rounded-lg bg-red-50">
      Error: {error}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground">Discover premium VFX assets and UI kits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collections.map((item) => (
          <div key={item.id} className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="aspect-video relative overflow-hidden bg-muted">
              <img 
                src={item.previewImage?.filePath ? `http://localhost:8080${item.previewImage.filePath}` : "/placeholder.png"} 
                alt={item.name}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                  ★ {item.author.rating}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Price</span>
                  <span className="text-xl font-black text-foreground">${item.price}</span>
                </div>
                <Button size="sm" className="rounded-full shadow-lg hover:shadow-primary/30">
                  Details <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}