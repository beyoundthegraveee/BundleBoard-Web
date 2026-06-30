"use client"

import React from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { FALLBACK_IMAGE } from '@/lib/constants';
import { useQuery } from '@apollo/client/react';
import { GetTopLikedCollectionsDocument } from '@/graphql/generated';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card'; 
import Image from 'next/image';

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";

interface CollectionResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  likesCount: number;
  isLiked: boolean;
  author: {
    username: string;
  };
  galleryImages: {
    filePath: string;
  }[];
}

export function HighestRatedCarousel() {
  const { data, loading, error } = useQuery(GetTopLikedCollectionsDocument, {
    variables: { limit: 5 },
    fetchPolicy: 'cache-first'
  });

  const fetchedCollections = (data?.getTopLikedCollections || []) as CollectionResponse[];
  const isMarquee = fetchedCollections.length >= 4;

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-muted-foreground font-sans">
        <Loader2 className="animate-spin h-5 w-5 mb-3 text-primary stroke-[1.5]" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Compiling trending nodes...</span>
      </div>
    );
  }

  if (error || fetchedCollections.length === 0) {
    return (
      <div className="w-full text-center py-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 font-sans">
        [SYSTEM]: No collections available yet.
      </div>
    );
  }

  const carouselItems = isMarquee 
    ? [...fetchedCollections, ...fetchedCollections] 
    : fetchedCollections;

  return (
    <div className="relative w-full overflow-hidden font-sans py-8">
      {isMarquee && (
        <>
          <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </>
      )}

      {isMarquee && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 35s linear infinite;
              display: flex;
              width: max-content;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `
        }} />
      )}

      <div className={
        isMarquee 
          ? "animate-marquee" 
          : "flex overflow-x-auto snap-x snap-mandatory md:overflow-visible md:flex-wrap items-center justify-start md:justify-center w-full pb-4 md:pb-0 custom-scrollbar"
      }>
        {carouselItems.map((item, index) => {
          const fileName = item.galleryImages?.[0]?.filePath || "";
          const imageUrl = fileName.startsWith('http') 
            ? fileName 
            : fileName ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}` : "";

          return (
            <div key={`${item.id}-${index}`} className="px-3 sm:px-4 md:px-5 mb-6 md:mb-0 shrink-0 snap-center">
              <CardContainer containerClassName="py-0" className="w-[240px] sm:w-[280px] md:w-[360px]">
                <CardBody className="relative group/card w-full h-auto rounded-none flex flex-col">
                  
                  <Link href={`/collection/${item.id}`} className="block w-full h-full" draggable={false}>
                    <CardItem translateZ="50" className="w-full aspect-[4/3] relative overflow-hidden border border-white/[0.04] bg-[#111013]">
                      <Image 
                        src={imageUrl || FALLBACK_IMAGE || ""}
                        alt={item.name}
                        draggable={false}
                        fill
                        sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 360px"
                        className="object-cover opacity-75 group-hover/card:opacity-100 transition-all duration-500 block"
                      />
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-background/80 backdrop-blur-md px-2 py-1 border border-white/[0.08] z-10 rounded-none flex items-center gap-1.5 shadow-xl">
                        <Heart size={10} className={item.isLiked ? 'fill-primary text-primary' : 'fill-none text-primary'} />
                        <span className="text-[10px] font-bold tracking-wider">{item.likesCount || 0}</span>
                      </div>
                      
                      {item.price === 0 && (
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary/20 backdrop-blur-md px-2 py-1 border border-primary/50 z-10 rounded-none">
                          <span className="text-primary text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Free</span>
                        </div>
                      )}
                    </CardItem>
                    
                    <CardItem translateZ="30" className="w-full pt-4 md:pt-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline gap-4">
                          <h3 className="font-bold text-[15px] md:text-[19px] leading-tight tracking-tight uppercase text-foreground transition-colors group-hover/card:text-primary truncate">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-[12px] md:text-[14px] leading-relaxed line-clamp-2 font-normal opacity-80">
                          {item.description || "No description data submitted."}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-6 pt-4 border-t border-white/[0.03] flex justify-between items-center text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">
                        <div className="truncate pr-2">
                          <span>Author: </span>
                          <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                        </div>
                        <span className="opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:text-primary transform md:translate-x-2 md:group-hover/card:translate-x-0 transition-all duration-300 font-semibold text-[10px] md:text-[12px] shrink-0">
                          Extract →
                        </span>
                      </div>
                    </CardItem>

                  </Link>
                </CardBody>
              </CardContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}