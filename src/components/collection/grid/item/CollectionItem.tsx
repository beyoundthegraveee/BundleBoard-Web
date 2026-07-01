import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FALLBACK_IMAGE } from '@/lib/constants';

interface CollectionItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    author: { username: string } | null;
    galleryImages: { filePath: string }[];
  };
  supabaseBase: string;
}

export const CollectionItem = memo(({ item, supabaseBase }: CollectionItemProps) => {
  const fileName = item.galleryImages?.[0]?.filePath || "";
  const imageUrl = fileName.startsWith('http') 
    ? fileName 
    : fileName ? `${supabaseBase}/${encodeURIComponent(fileName)}` : "";

  return (
    <Link 
      href={`/collection/${item.id}`} 
      className="batch-item group flex flex-col bg-transparent cursor-pointer overflow-hidden text-foreground will-change-transform"
    >
      <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.04] bg-[#111013]">
        <Image 
          src={imageUrl || FALLBACK_IMAGE || ''} 
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full opacity-75 group-hover:opacity-100 transition-all duration-500"
        />
      </div>

      <div className="pt-3 md:pt-5 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5 md:space-y-2.5">
          <div className="flex justify-between items-start md:items-baseline gap-2 md:gap-4 flex-col sm:flex-row">
            <h3 className="font-display font-bold text-[11px] sm:text-[13px] md:text-[16px] leading-tight tracking-widest uppercase text-foreground transition-colors group-hover:text-zinc-400 line-clamp-2 sm:line-clamp-1">
              {item.name}
            </h3>
            <span className="font-display font-bold text-[10px] md:text-[14px] text-foreground tracking-tight shrink-0">
              {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
            </span>
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-[12px] md:text-[14px] leading-relaxed line-clamp-2 font-normal opacity-80">
            {item.description || "No parameters or description data submitted."}
          </p>
        </div>

        <div className="mt-3 pt-3 md:mt-6 md:pt-4 border-t border-white/[0.03] flex justify-between items-center text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
          <div className="truncate pr-2">
            <span>Author: </span>
            <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
          </div>
          <span className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:text-primary transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-semibold text-[12px] shrink-0">
            Extract →
          </span>
        </div>
      </div>
    </Link>
  );
});

CollectionItem.displayName = 'CollectionItem';