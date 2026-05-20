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
          throw new Error(result.errors[0].message || "GRAPHQL_QUERY_FAILED")
        }

        setCollection(result.data?.getCollectionById)
      } catch (err: any) {
        console.error("❌ CRITICAL_FETCH_ERROR:", err)
        setErrorLog(err.message || "MUTATION_DISCONNECT")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCollection()
  }, [id, session])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-mono">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <span className="font-black uppercase tracking-[0.3em] text-[10px]">Accessing_Asset_Data...</span>
    </div>
  )

  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center font-black uppercase text-red-600">
      [404_ERROR]: Asset_Not_Found
    </div>
  )

  return (
    <main className="min-h-screen bg-white text-black font-mono p-4 md:p-10 lg:p-16">
      <nav className="mb-12 border-b-2 border-black pb-6 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 font-black uppercase text-[11px] hover:bg-black hover:text-white p-2 transition-all"
        >
          <ArrowLeft size={14} /> [ RETURN_TO_GALLERY ]
        </button>
        <div className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
          System_Node: /root/collections/{id}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        <div className="lg:col-span-8 space-y-12">
          <div className="border-4 border-black bg-zinc-100 shadow-[16px_16px_0px_rgba(0,0,0,1)] overflow-hidden">
            <img 
              src={collection.previewImage.filePath} 
              alt={collection.name} 
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 block"
            />
          </div>
          <CollectionDetails collection={collection} />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-8">
             <AuthorSidebar author={collection.author} />

             <div className="border-2 border-black p-6 bg-zinc-50 text-[10px] font-black uppercase space-y-2 opacity-60 italic">
               <div>Transmission_Status: Encrypted</div>
               <div>Format_Support: Verified</div>
               <div>License_Type: Commercial_v1</div>
             </div>
          </div>
        </div>

      </div>
    </main>
  )
}