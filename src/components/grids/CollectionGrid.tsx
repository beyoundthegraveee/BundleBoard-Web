"use client";

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from "lucide-react"
import { useQuery } from '@apollo/client/react'
import { GetCollectionsPagedDocument } from '@/graphql/generated'
import { BatchGrid } from './BatchGrid'
import { CollectionItem } from '../collectionComponents/CollectionItem'

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
const PAGE_SIZE = 21;

interface Collection {
  id: string;
  name: string;
  description: string;
  price: number;
  author: {
    username: string;
    totalSales: number;
  };
  galleryImages: {
    filePath: string;
  }[];
}

export function CollectionGrid() {
  const { status } = useSession()
  const { data, loading, error, refetch } = useQuery(GetCollectionsPagedDocument, {
    variables: {
      page: 0,
      size: PAGE_SIZE
    },
    skip: status === "loading",
    fetchPolicy: 'cache-first'
  });

  const [shuffledCollections, setShuffledCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (data?.getAllCollections) {
      const shuffled = [...data.getAllCollections].sort(() => Math.random() - 0.5);
      const timer = setTimeout(() => {
        setShuffledCollections(shuffled as Collection[]);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [data?.getAllCollections]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center py-40 space-y-3 font-sans">
      <Loader2 className="animate-spin h-5 w-5 text-muted-foreground stroke-[1.5]" />
      <span className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-medium">Syncing active registry...</span>
    </div>
  )

  if (error) return (
    <div className="p-8 border border-destructive/20 text-destructive font-sans text-xs uppercase tracking-wider bg-destructive/5 flex flex-col items-start gap-4 rounded-none max-w-xl mx-auto m-4">
      <div>
        <span className="font-bold mr-2">Registry connection error:</span> 
        {error.message || "FAILED_TO_STREAM_DATA"}
      </div>
      <button 
        onClick={() => refetch()}
        className="flex items-center gap-2 border border-destructive/40 px-4 py-2 text-[10px] font-semibold uppercase hover:bg-destructive hover:text-white transition-all"
      >
        Reinitialize Stream
      </button>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-12">
      <BatchGrid className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-12 lg:gap-x-14 lg:gap-y-20">
        {shuffledCollections.slice(0, 12).map((item) => (
          <CollectionItem 
            key={item.id} 
            item={item} 
            supabaseBase={SUPABASE_PREVIEWS_BASE} 
          />
        ))}
      </BatchGrid>
    </div>
  )
}