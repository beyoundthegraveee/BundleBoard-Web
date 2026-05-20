"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, ArrowUpRight, RefreshCw } from "lucide-react"
import Link from "next/link"

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";

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
  const { data: session } = useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true)
      setError(null)
      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if ((session as any)?.accessToken) {
          headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
          method: "POST",
          headers: headers,
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
        
        // Перехватываем внутренние GraphQL ошибки (например, 500 из-за упавшего маппера на бэке)
        if (result.errors) {
          throw new Error(result.errors[0].message || "INTERNAL_SERVER_ERROR")
        }
        
        setCollections(result.data?.getAllCollections || [])
      } catch (err: any) {
        console.error("❌ GRID_FETCH_FAILURE:", err)
        setError(err.message || "PROTOCOL_MUTATION_FAILED")
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [session, refreshTrigger]) // Перезапускаем при смене токена или по клику на рефреш

  if (loading) return (
    <div className="flex flex-col justify-center items-center p-40 space-y-4 font-mono">
      <Loader2 className="animate-spin h-10 w-10 text-red-600 stroke-[3]" />
      <span className="text-black font-black uppercase tracking-[0.3em] text-[10px]">Syncing_Inventory...</span>
    </div>
  )

  if (error) return (
    <div className="p-10 border-4 border-red-600 text-red-600 font-mono text-xs uppercase tracking-tighter mx-4 my-10 bg-red-50 flex flex-col items-start gap-4 shadow-[8px_8px_0px_rgba(239,68,68,0.15)]">
      <div>
        <span className="bg-red-600 text-white px-1 font-black mr-2">CRITICAL_NETWORK_ERROR:</span> 
        {error}
      </div>
      <button 
        onClick={() => setRefreshTrigger(prev => prev + 1)}
        className="flex items-center gap-2 border-2 border-red-600 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5"
      >
        <RefreshCw size={12} /> Reinitialize_Connection
      </button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-black border-y-2 border-black font-mono">
      {collections.map((item) => {
        const fileName = item.previewImage?.filePath || "";
        const imageUrl = fileName.startsWith('http') 
          ? fileName 
          : `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}`;

        return (
          <Link 
            href={`/collection/${item.id}`} 
            key={item.id} 
            className="group bg-white relative flex flex-col border-r border-black last:border-r-0 cursor-pointer overflow-hidden text-black"
          >
            {/* Image Section */}
            <div className="aspect-[16/10] relative overflow-hidden border-b border-black bg-zinc-100">
              <img 
                src={imageUrl || "/placeholder-brutal.png"} 
                alt={item.name}
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 block"
              />
              <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase italic tracking-widest">
                Raw_Asset_v1.0
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-black text-4xl leading-[0.8] uppercase tracking-tighter italic break-words transition-colors group-hover:text-red-600">
                    {item.name}
                  </h3>
                  <ArrowUpRight className="text-black group-hover:text-red-600 transition-colors shrink-0" size={32} />
                </div>
                <p className="text-black/40 text-[10px] font-bold uppercase leading-tight italic line-clamp-2">
                  // {item.description || "No data description log available."}
                </p>
              </div>

              {/* Footer Section */}
              <div className="mt-10">
                <div className="flex justify-between items-end border-t border-black/10 py-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Operator</span>
                    <span className="font-black text-sm uppercase italic">@{item.author?.username || "unknown"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Value</span>
                    <p className="font-black text-2xl leading-none">${item.price}</p>
                  </div>
                </div>
                <button className="w-full bg-black text-white py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-red-600 transition-all duration-150 active:scale-[0.98]">
                  Initialize_Transfer
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  )
}