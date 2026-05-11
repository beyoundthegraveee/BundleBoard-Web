"use client"

import React, { useEffect, useState } from 'react'
import { Loader2, ArrowUpRight, AlertCircle } from "lucide-react"

const SUPABASE_PREVIEWS_BASE = "https://lemevepzkbfxkunmrgor.supabase.co/storage/v1/object/public/previews";

interface Collection {
  id: string;
  name: string;
  description: string;
  price: number;
  author: {
    username: string;
    totalSales: number;
  };
  previewImage: {
    filePath: string;
  };
}

export function CollectionGrid() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:8080/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetAllCollections {
                getAllCollections {
                  id
                  name
                  description
                  price
                  author {
                    username
                    totalSales
                  }
                  previewImage {
                    filePath
                  }
                }
              }
            `,
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
      <Loader2 className="animate-spin h-10 w-10 text-red-600" />
      <span className="text-black font-black uppercase tracking-[0.3em] text-[10px]">Syncing_Inventory...</span>
    </div>
  )

  if (error) return (
    <div className="p-10 border-2 border-red-600 text-red-600 font-mono text-xs uppercase tracking-tighter mx-4">
      [CRITICAL_ERROR]: {error}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-black border-y-2 border-black">
      {collections.map((item) => {
        const fileName = item.previewImage?.filePath || "";
        const imageUrl = fileName.startsWith('http') 
          ? fileName 
          : `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}`;

        return (
          <div key={item.id} className="group bg-white relative flex flex-col border-r border-black last:border-r-0">
            <div className="aspect-[16/10] relative overflow-hidden border-b border-black bg-[#eee]">
              <img 
                src={imageUrl} 
                alt={item.name}
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase italic tracking-widest">
                Raw_Asset_v1.0
              </div>
            </div>

            <div className="p-8 flex-grow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-black text-4xl leading-[0.8] uppercase tracking-tighter italic break-words">
                    {item.name}
                  </h3>
                  <ArrowUpRight className="text-black group-hover:text-red-600 transition-colors shrink-0" size={32} />
                </div>
                <p className="text-black/40 text-[10px] font-bold uppercase leading-tight italic line-clamp-2">
                  // {item.description}
                </p>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-end border-t border-black/10 py-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Operator</span>
                    <span className="font-black text-sm uppercase italic">@{item.author.username}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Value</span>
                    <p className="font-black text-2xl leading-none">${item.price}</p>
                  </div>
                </div>
                <button className="w-full bg-black text-white py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-red-600 transition-all active:scale-[0.98]">
                  Initialize_Transfer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}