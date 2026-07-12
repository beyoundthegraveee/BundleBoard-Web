import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Layers } from "lucide-react"
import { FALLBACK_IMAGE } from '@/lib/constants'
import { GetCollectionsByTagQuery } from '@/graphql/generated'
import { BatchGrid } from './BatchGrid'

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
type CollectionNode = NonNullable<GetCollectionsByTagQuery['getCollectionsByTag']['collections']>[number];
interface CategoryCollectionGridProps {
  collections: CollectionNode[];
}

export function CategoryCollectionGrid({ collections }: CategoryCollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="border border-dashed border-border p-8 md:p-16 text-center max-w-xl mx-auto rounded-none bg-muted/10 animate-in fade-in duration-300">
        <Layers className="mx-auto text-muted-foreground/30 mb-3 stroke-[1.3]" size={28} />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Data Stream Terminal Empty</h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-normal leading-normal">
          No deployed registry packages found matching this directory parameter.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-12">
      <BatchGrid className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 font-sans">
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
              className={`batch-item group flex flex-col bg-card border border-border p-2 sm:p-4 hover:border-foreground/30 transition-colors duration-300 will-change-transform ${!hasValidSlug ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted border border-border/50">
                <Image 
                  src={imageUrl || FALLBACK_IMAGE || ""} 
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 block"
                />
              </div>

              <div className="pt-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-start md:items-baseline gap-1 sm:gap-2 flex-col sm:flex-row">
                    <h3 className="font-bold text-[11px] sm:text-[13px] md:text-[15px] leading-tight tracking-tight uppercase text-foreground truncate max-w-full transition-colors group-hover:text-primary">
                      {item.name}
                    </h3>
                    <span className="font-bold text-[10px] sm:text-[12px] md:text-[14px] text-foreground tracking-tight font-mono shrink-0">
                      {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-[11px] md:text-[12px] leading-relaxed line-clamp-2 font-normal opacity-70">
                    {item.description || "No parameters or description data submitted."}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border flex justify-between items-center text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wider">
                  <div className="truncate pr-1">
                    <span>By </span>
                    <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                  </div>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors font-bold hidden sm:block">
                    Extract →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </BatchGrid>
    </div>
  )
}