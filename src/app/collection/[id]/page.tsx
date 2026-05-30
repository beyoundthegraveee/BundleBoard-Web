"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from "lucide-react"
import CollectionDetails from '@/components/CollectionDetails'
import AuthorSidebar from '@/components/AuthorSidebar'
import { useSession } from 'next-auth/react'

export default function CollectionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorLog, setErrorLog] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setErrorLog(null)
        const headers: HeadersInit = { "Content-Type": "application/json" }
        if ((session as any)?.accessToken) {
          headers["Authorization"] = `Bearer ${(session as any).accessToken}`
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: `
              query GetCollection($id: ID!) {
                getCollectionById(id: $id) {
                  id
                  name
                  description
                  price
                  videoTutorialUrl
                  author {
                    username
                    bio
                    rating
                    totalSales
                    socialLinks { platform url }
                    avatarUrl
                  }
                  previewImage { filePath }
                  mediaResource { fileName fileSize mimeType provider }
                }
              }
            `,
            variables: { id }
          }),
        })
        const result = await response.json()
        
        if (result.errors) {
          throw new Error(result.errors[0].message || "FAILED_TO_FETCH_COLLECTION")
        }

        setCollection(result.data?.getCollectionById)
      } catch (err: any) {
        console.error("CATALOG_FETCH_FAILURE:", err)
        setErrorLog(err.message || "STREAM_DISCONNECT")
      } finally {
        if (id) setLoading(false)
      }
    }
    if (id) fetchCollection()
  }, [id, session])

  if (loading) return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
      <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
      <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Accessing asset parameters...</span>
    </div>
  )

  if (!collection) return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center font-sans font-semibold uppercase text-xs tracking-widest text-destructive bg-background">
      Error: Asset catalog node not found
    </div>
  )

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-10 lg:p-16 relative">
      
      <div 
        className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`, 
          backgroundSize: '32px 32px' 
        }} 
      />

      <nav className="mb-14 border-b border-border/40 pb-5 flex justify-between items-center relative z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2.5 font-semibold uppercase text-[11px] tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-px transition-transform" /> 
          Back to catalog
        </button>
        <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest text-muted-foreground">
          Catalog Item Reference // {id}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
        
        <div className="lg:col-span-8 space-y-12">
          <div className="border border-border/40 bg-card shadow-md overflow-hidden rounded-none aspect-[16/10]">
            <img 
              src={collection.previewImage?.filePath} 
              alt={collection.name} 
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500 block"
            />
          </div>
          <CollectionDetails collection={collection} />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            
             <AuthorSidebar author={collection.author} />

             <div className="border border-border/40 p-5 bg-card/50 text-[11px] font-medium uppercase text-muted-foreground space-y-2 rounded-none tracking-wider">
               <div className="flex justify-between border-b border-border/20 pb-1.5">
                 <span>Transmission Mode</span>
                 <span className="text-foreground font-semibold">Encrypted</span>
               </div>
               <div className="flex justify-between border-b border-border/20 pb-1.5">
                 <span>Format Verification</span>
                 <span className="text-foreground font-semibold">Passed</span>
               </div>
               <div className="flex justify-between">
                 <span>License Standard</span>
                 <span className="text-foreground font-semibold">Commercial 1.0</span>
               </div>
             </div>

          </div>
        </div>

      </div>
    </main>
  )
}