"use client"

import React, { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@apollo/client/react';
import { GetSortedCollectionsDocument } from '@/graphql/generated';
import { FALLBACK_IMAGE } from '@/lib/constants';
import { BatchGrid } from './BatchGrid';

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
const PAGE_SIZE = 12;

interface SortCollectionGridProps {
  sortBy: string;
  mimeTypes: string[];
}

export function SortCollectionGrid({ sortBy, mimeTypes }: SortCollectionGridProps) {
  const [page, setPage] = useState(0);
  const filterKey = `${sortBy}_${(mimeTypes || []).join(',')}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(0);
  }

  const { data, loading, error, refetch } = useQuery(GetSortedCollectionsDocument, {
    variables: {
      page: page,
      size: PAGE_SIZE,
      sortBy: sortBy,
      mimeTypes: mimeTypes && mimeTypes.length > 0 ? mimeTypes : null
    },
    fetchPolicy: 'cache-and-network'
  });

  const collections = data?.getSortedCollections || [];
  const hasNextPage = collections.length === PAGE_SIZE;

  if (error) {
    return (
      <div className="p-8 border border-destructive/20 text-destructive font-sans text-xs uppercase tracking-wider bg-destructive/5 flex flex-col items-start gap-4 rounded-none max-w-xl mb-8 mx-4">
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
    );
  }

  if (loading && collections.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-3 font-sans">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground stroke-[1.5]" />
        <span className="text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-medium">Syncing active registry...</span>
      </div>
    );
  }

  return (
    <div className="font-sans pb-12 px-4 md:px-12">
      <BatchGrid className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-x-14 gap-y-12 md:gap-y-20">
        {collections.map((item) => {
          const fileName = item.galleryImages?.[0]?.filePath || "";
          const imageUrl = fileName.startsWith('http') 
            ? fileName 
            : fileName ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}` : "";

          const hasValidSlug = Boolean(item.slug && item.author?.username);
          const href = hasValidSlug ? `/${item.author!.username}/${item.slug}` : "#";
          return (
            <Link 
              href={href}
              onClick={(e) => {
                if (!hasValidSlug) e.preventDefault();
              }}
              aria-disabled={!hasValidSlug}
              key={item.id} 
              className={`batch-item group flex flex-col bg-transparent cursor-pointer overflow-hidden text-foreground ${!hasValidSlug ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.04] bg-[#111013]">
                <Image 
                  src={imageUrl || FALLBACK_IMAGE || ""} 
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-75 group-hover:opacity-100 transition-all duration-500 block"
                />
              </div>

              <div className="pt-3 md:pt-5 flex-grow flex flex-col justify-between">
                <div className="space-y-1 md:space-y-2.5">
                  <div className="flex justify-between items-start md:items-baseline gap-2 flex-col sm:flex-row">
                    <h3 className="font-bold text-[11px] sm:text-[13px] md:text-[19px] leading-tight tracking-tight uppercase text-foreground transition-colors group-hover:text-zinc-400 truncate w-full">
                      {item.name}
                    </h3>
                    <span className="font-bold text-[10px] md:text-[18px] text-foreground tracking-tight shrink-0">
                      {!item.price || item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] md:text-[14px] leading-relaxed line-clamp-2 font-normal opacity-80">
                    {item.description || "No parameters or description data submitted for this catalog item."}
                  </p>
                </div>

                <div className="mt-3 md:mt-6 pt-2 md:pt-4 border-t border-white/[0.03] flex justify-between items-center text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
                  <div className="truncate pr-1">
                    <span>Author: </span>
                    <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                  </div>
                  <span className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:text-primary transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-semibold text-[12px]">
                    Extract →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </BatchGrid>

      {collections.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/40 mt-12 md:mt-16 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 border border-border/60 bg-background text-foreground text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
          >
            <ChevronLeft size={12} className="stroke-[2]" />
            Prev
          </button>

          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Page {page + 1}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage || loading}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 border border-border/60 bg-background text-foreground text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
          >
            Next
            <ChevronRight size={12} className="stroke-[2]" />
          </button>
        </div>
      )}
    </div>
  );
}