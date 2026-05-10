"use client"

import React, { useEffect, useState } from 'react'
import { Loader2, ArrowUpRight } from "lucide-react"

interface Collection {
  id: string;
  name: string;
  description: string;
  price: number;
  author: {
    id: string;
    rating: number;
    totalSales: number;
    username: string;
  };
  previewImage: {
    filePath: string;
    fileName: string;
  };
}

export const GET_ALL_COLLECTIONS = `
  query GetAllCollections {
    getAllCollections {
      id
      name
      description
      price
      author {
        id
        rating
        totalSales
        username
      }
      previewImage {
        filePath
        fileName
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
    <div className="flex flex-col justify-center items-center p-40 space-y-4">
      <Loader2 className="animate-spin h-12 w-12 text-orange-600" />
      <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Syncing with Grid...</span>
    </div>
  )

  if (error) return (
    <div className="text-orange-600 text-center p-10 font-black border-2 border-orange-600/20 rounded-sm bg-orange-600/5 mx-4 uppercase italic">
      System Error: {error}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Featured <br /> 
            <span className="text-orange-600">Bundles</span>
          </h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Total Assets</p>
          <p className="text-2xl font-black italic">{collections.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
        {collections.map((item) => (
          <div key={item.id} className="group flex flex-col cursor-pointer relative">
            
            <div className="aspect-square relative overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-orange-600/50 transition-all duration-500 shadow-2xl">
              <img 
                src={item.previewImage?.filePath || "/placeholder.png"} 
                alt={item.name}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
              />

              <div className="absolute top-0 left-0 flex flex-col">
                {item.author.totalSales > 100 && (
                  <div className="bg-orange-600 text-[10px] font-black px-3 py-1.5 uppercase text-white italic tracking-tighter">
                    Hot Asset
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white p-2 rounded-full text-black">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="space-y-1">
                <h3 className="font-black text-2xl leading-[0.9] uppercase tracking-tighter group-hover:text-orange-600 transition-colors italic">
                  {item.name}
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  Authored by <span className="text-zinc-300">@{item.author.username || 'unknown'}</span>
                </p>
              </div>
              
              <div className="flex items-center justify-between border-y border-white/5 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Price</span>
                  <span className="text-lg font-black italic text-orange-600">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Stats</span>
                  <div className="flex items-center gap-2 text-xs font-black italic">
                    <span>{item.author.rating} ⭐</span>
                    <span className="text-zinc-700">/</span>
                    <span>{item.author.totalSales} SL</span>
                  </div>
                </div>
              </div>

              <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2 italic opacity-60 group-hover:opacity-100 transition-opacity">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}