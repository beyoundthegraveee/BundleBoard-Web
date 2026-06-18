"use client"

import React from 'react'
import Link from 'next/link'
import { Layers } from "lucide-react"
import { FALLBACK_IMAGE } from '@/lib/constants'
import { GetCollectionsByTagQuery } from '@/graphql/generated'

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
type CollectionNode = NonNullable<GetCollectionsByTagQuery['getCollectionsByTag']['collections']>[number];
interface CategoryCollectionGridProps {
  collections: CollectionNode[];
}

export function CategoryCollectionGrid({ collections }: CategoryCollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="border border-dashed border-border p-16 text-center max-w-xl mx-auto rounded-none bg-muted/10 animate-in fade-in duration-300">
        <Layers className="mx-auto text-muted-foreground/30 mb-3 stroke-[1.3]" size={28} />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Data Stream Terminal Empty</h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-normal leading-normal">
          No deployed registry packages found matching this directory parameter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 font-sans animate-in fade-in duration-300">
      {collections.map((item) => {
        const fileName = item.galleryImages?.[0]?.filePath || "";
        const imageUrl = fileName.startsWith('http') 
          ? fileName 
          : fileName ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}` : "";

        return (
          <Link 
            href={`/collection/${item.id}`} 
            key={item.id} 
            className="group flex flex-col bg-transparent cursor-pointer overflow-hidden text-foreground border border-border p-4 bg-card hover:border-foreground/30 transition-colors duration-300"
          >
            <div className="aspect-video relative overflow-hidden bg-muted border border-border/50">
              <img 
                src={imageUrl || FALLBACK_IMAGE} 
                alt={item.name}
                className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-500 block"
                loading="lazy"
              />
            </div>

            <div className="pt-4 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-bold text-[15px] leading-tight tracking-tight uppercase text-foreground truncate max-w-[75%] transition-colors group-hover:text-primary">
                    {item.name}
                  </h3>
                  <span className="font-bold text-[14px] text-foreground tracking-tight font-mono">
                    {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-muted-foreground text-[12px] leading-relaxed line-clamp-2 font-normal opacity-70">
                  {item.description || "No parameters or description data submitted."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[9px] text-muted-foreground uppercase tracking-wider">
                <div>
                  <span>By </span>
                  <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                </div>
                <span className="text-muted-foreground group-hover:text-primary transition-colors font-bold">
                  Extract →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  )
}