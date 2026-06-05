"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from "lucide-react"
import Link from "next/link"

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
const PAGE_SIZE = 9;

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
  const { data: session, status } = useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [page, setPage] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [hasMore, setHasMore] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleReset = () => {
    setCollections([])
    setPage(0)
    setHasMore(true)
    setRefreshTrigger(prev => prev + 1)
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!hasMore && page !== 0) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchPage = async () => {
      if (page === 0) setInitialLoading(true);
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if ((session as any)?.accessToken) {
          headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql", {
          method: "POST",
          headers: headers,
          signal: signal,
          body: JSON.stringify({
            query: `
              query GetCollectionsPaged($page: Int!, $size: Int!) {
                getAllCollections(page: $page, size: $size) {
                  id
                  name
                  description
                  price
                  author {
                    username
                    totalSales
                  }
                  # 🟢 Изменено: запрашиваем галерею
                  galleryImages {
                    filePath
                  }
                }
              }
            `,
            variables: {
              page: page,
              size: PAGE_SIZE
            }
          }),
        });

        const result = await response.json();
        
        if (result.errors) {
          throw new Error(result.errors[0].message || "INTERNAL_SERVER_ERROR");
        }

        const newItems: Collection[] = result.data?.getAllCollections || [];

        if (!signal.aborted) {
          if (newItems.length < PAGE_SIZE) {
            setHasMore(false);
          }

          setCollections((prev) => {
            return page === 0 ? newItems : [...prev, ...newItems];
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || "FAILED_TO_STREAM_DATA");
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      controller.abort();
    };
  }, [session, status, page, refreshTrigger]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || initialLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }, {
      rootMargin: "250px"
    });

    if (node) observerRef.current.observe(node);
  }, [loading, initialLoading, hasMore]);

  if (initialLoading) return (
    <div className="flex flex-col justify-center items-center py-40 space-y-3 font-sans">
      <Loader2 className="animate-spin h-5 w-5 text-muted-foreground stroke-[1.5]" />
      <span className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-medium">Syncing active registry...</span>
    </div>
  )

  if (error) return (
    <div className="p-8 border border-destructive/20 text-destructive font-sans text-xs uppercase tracking-wider bg-destructive/5 flex flex-col items-start gap-4 rounded-none max-w-xl mx-auto">
      <div>
        <span className="font-bold mr-2">Registry connection error:</span> 
        {error}
      </div>
      <button 
        onClick={handleReset}
        className="flex items-center gap-2 border border-destructive/40 px-4 py-2 text-[10px] font-semibold uppercase hover:bg-destructive hover:text-white transition-all"
      >
        Reinitialize Stream
      </button>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-24">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-14 gap-y-20 font-sans">
        {collections.map((item) => {
          const fileName = item.galleryImages?.[0]?.filePath || "";
          const imageUrl = fileName.startsWith('http') 
            ? fileName 
            : fileName ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}` : "";

          return (
            <Link 
              href={`/collection/${item.id}`} 
              key={item.id} 
              className="group flex flex-col bg-transparent cursor-pointer overflow-hidden text-foreground"
            >
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.04] bg-[#111013]">
                <img 
                  src={imageUrl || "/placeholder.png"} 
                  alt={item.name}
                  className="object-cover w-full h-full opacity-75 group-hover:opacity-100 transition-all duration-500 block"
                />
              </div>

              <div className="pt-5 flex-grow flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="font-bold text-[19px] leading-tight tracking-tight uppercase text-foreground transition-colors group-hover:text-zinc-400">
                      {item.name}
                    </h3>
                    <span className="font-bold text-[18px] text-foreground tracking-tight">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-2 font-normal opacity-80">
                    {item.description || "No parameters or description data submitted for this catalog item."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.03] flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider">
                  <div>
                    <span>Author: </span>
                    <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 group-hover:text-primary transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-semibold text-[12px]">
                    Extract Node →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="w-full pt-14 flex justify-center border-t border-white/[0.05]">
        <div ref={lastElementRef} className="flex justify-center w-full">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
              <Loader2 className="animate-spin h-3.5 w-3.5 text-primary" />
              Streaming page data node...
            </div>
          )}
          {!hasMore && collections.length > 0 && (
            <div className="text-muted-foreground font-normal uppercase tracking-[0.25em] text-[10px] opacity-30">
              // End of active directory stream
            </div>
          )}
        </div>
      </div>
    </div>
  )
}